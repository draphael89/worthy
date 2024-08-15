import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import OpenAI from 'openai';
import { AdData } from '../../app/types/AdData';
import { debounce } from 'lodash';
import { Profile } from '../../app/types/ProfileTypes';

// Logging functions
const log = (message: string, data?: any) => {
  console.log(`[AIContext] ${message}`, data);
};
const logError = (message: string, error: any) => {
  console.error(`[AIContext] ${message}`, error);
};

// Interface for the AI context
export interface AIContextType {
  insights: Insight[];
  isLoading: boolean;
  error: string | null;
  askQuestion: (question: string) => Promise<string>;
  refreshInsights: () => Promise<void>;
  lastRefreshTime: number | null;
  nextRefreshTime: number | null;
  summarizeProfile: (messages: Array<{ role: string; content: string }>, latestResponse: string) => Promise<Profile>;
}

// Interface for an insight object
export interface Insight {
  title: string;
  content: string;
  visualizationData: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
    }[];
  };
}

// Define the shape of the context value
interface AIContextValue {
  insights: Insight[];
  isLoading: boolean;
  error: string | null;
  askQuestion: (question: string) => Promise<string>;
  refreshInsights: () => Promise<void>;
  lastRefreshTime: number | null;
  nextRefreshTime: number | null;
  summarizeProfile: (messages: Array<{ role: string; content: string }>, latestResponse: string) => Promise<Profile>;
}

// Create the context
const AIContext = createContext<AIContextValue | undefined>(undefined);

// Custom hook to use the AI context
export const useAIContext = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAIContext must be used within an AIProvider');
  }
  return context;
};

// Props for the AIProvider component
interface AIProviderProps {
  children: React.ReactNode;
  data: AdData[];
}

// Constants for API call intervals and refresh times
const API_CALL_INTERVAL = 5000; // 5 seconds in milliseconds
const INSIGHTS_REFRESH_INTERVAL = 3600000; // 1 hour in milliseconds
const REFRESH_COOLDOWN = 300000; // 5 minutes in milliseconds

// AIProvider component
export const AIProvider: React.FC<AIProviderProps> = ({ children, data }) => {
  // State variables
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastApiCall, setLastApiCall] = useState<number>(0);
  const [lastRefreshTime, setLastRefreshTime] = useState<number | null>(null);
  const [nextRefreshTime, setNextRefreshTime] = useState<number | null>(null);

  // Initialize OpenAI client (using bracket notation for env variable)
  const openai = useMemo(() => new OpenAI({
    apiKey: process.env['REACT_APP_OPENAI_API_KEY'], // Correct way to access env var
    dangerouslyAllowBrowser: true
  }), []);

  // Check if an API call can be made
  const canMakeApiCall = useCallback(() => {
    const now = Date.now();
    return now - lastApiCall >= API_CALL_INTERVAL;
  }, [lastApiCall]);

  // Check if insights can be refreshed
  const canRefresh = useCallback(() => {
    if (!lastRefreshTime) return true;
    const now = Date.now();
    return now - lastRefreshTime >= REFRESH_COOLDOWN;
  }, [lastRefreshTime]);

  // Update the last API call time
  const updateLastApiCall = useCallback(() => {
    setLastApiCall(Date.now());
    log('Updated last API call time');
  }, []);

  // Update refresh times
  const updateRefreshTimes = useCallback(() => {
    const now = Date.now();
    setLastRefreshTime(now);
    setNextRefreshTime(now + REFRESH_COOLDOWN);
    log('Updated refresh times', { lastRefreshTime: now, nextRefreshTime: now + REFRESH_COOLDOWN });
  }, []);

  // Generate visualization data from insight content
  const generateVisualizationData = useCallback((insight: string) => {
    const numbers = insight.match(/\d+(\.\d+)?/g)?.map(Number) || [];
    const labels = ['Metric 1', 'Metric 2', 'Metric 3', 'Metric 4'].slice(0, numbers.length);

    log('Generated visualization data', { numbers, labels });

    return {
      labels,
      datasets: [
        {
          label: 'Insight Data',
          data: numbers,
          backgroundColor: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.6)`,
        },
      ],
    };
  }, []);

  // Parse insights from AI-generated text
  const parseInsights = useCallback((insightsText: string): Insight[] => {
    const insightStrings = insightsText.split('\n\n');
    const parsedInsights = insightStrings.map((insightString) => {
      const [title, ...contentLines] = insightString.split('\n');
      // Check for title before using it (fixes line 147)
      const content = contentLines.join('\n');
      return {
        title: title ? title.replace(/^Title:\s*/, '') : '', // Handle potential undefined title
        content: content.replace(/^Content:\s*/, ''),
        visualizationData: generateVisualizationData(content)
      };
    });

    log('Parsed insights', parsedInsights);
    return parsedInsights;
  }, [generateVisualizationData]);

  // Fetch insights from OpenAI
  const fetchInsights = useCallback(async (adData: AdData[]) => {
    if (!canMakeApiCall()) {
      setError('API call rate limited. Please wait before trying again.');
      logError('API call rate limited', null);
      return;
    }

    if (!canRefresh()) {
      setError(`Refresh not available. Please wait until ${new Date(nextRefreshTime!).toLocaleTimeString()}.`);
      logError('Refresh not available', { nextRefreshTime });
      return;
    }

    setIsLoading(true);
    setError(null);
    log('Fetching insights');

    try {
      const summarizedData = adData.slice(0, 100).map(ad => ({
        id: ad.id,
        date: ad.date,
        amountSpent: ad.amountSpent,
        impressions: ad.impressions,
        linkClicks: ad.linkClicks,
        purchases: ad.purchases
      }));

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are an AI assistant specialized in analyzing Facebook ad data. Provide insights in a structured format with a title and content. Include numeric data in your insights for visualization." },
          { role: "user", content: `Analyze the following Facebook ad data and provide 3 key insights:\n${JSON.stringify(summarizedData)}` }
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      // Safe access to message content (fixes line 195)
      const insightsText = response.choices[0]?.message?.content; 
      if (insightsText) {
        const parsedInsights = parseInsights(insightsText);
        if (parsedInsights.length > 0) {
          setInsights(parsedInsights);
          updateRefreshTimes();
          log('Insights fetched and parsed successfully', parsedInsights);
        } else {
          throw new Error('No valid insights generated');
        }
      } else {
        throw new Error('No insights generated');
      }
      updateLastApiCall();
    } catch (err: any) {
      setError(err.message || 'Failed to fetch AI insights');
      logError('Error fetching insights', err);
    } finally {
      setIsLoading(false);
    }
  }, [openai, canMakeApiCall, canRefresh, nextRefreshTime, parseInsights, updateLastApiCall, updateRefreshTimes]);

  // Debounce the fetchInsights function
  const debouncedFetchInsights = useMemo(() => debounce(fetchInsights, 1000), [fetchInsights]);

  // Function to ask a question to the AI
  const askQuestion = useCallback(async (question: string): Promise<string> => {
    if (!canMakeApiCall()) {
      logError('API call rate limited', null);
      throw new Error('API call rate limited. Please wait before trying again.');
    }

    log('Asking question to AI', { question });

    try {
      const summarizedData = data.slice(0, 100).map(ad => ({
        id: ad.id,
        date: ad.date,
        amountSpent: ad.amountSpent,
        impressions: ad.impressions,
        linkClicks: ad.linkClicks,
        purchases: ad.purchases
      }));

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are an AI assistant specialized in analyzing Facebook ad data." },
          { role: "user", content: `Question about Facebook ad data: ${question}\nContext: ${JSON.stringify(summarizedData)}` }
        ],
        max_tokens: 150,
        temperature: 0.7,
      });
      updateLastApiCall();

      // Safe access to message content (fixes line 249)
      const answer = response.choices[0]?.message?.content || 'No answer generated'; 

      log('Received answer from AI', { answer });
      return answer;
    } catch (err: any) {
      logError('Error asking question', err);
      throw new Error(err.message || 'Failed to get an answer from AI');
    }
  }, [data, openai, canMakeApiCall, updateLastApiCall]);

  // Function to refresh insights
  const refreshInsights = useCallback(async () => {
    if (data.length > 0 && canMakeApiCall() && canRefresh()) {
      log('Refreshing insights');
      await debouncedFetchInsights(data);
    } else {
      log('Skipping insights refresh', { dataLength: data.length, canMakeApiCall: canMakeApiCall(), canRefresh: canRefresh() });
    }
  }, [data, debouncedFetchInsights, canMakeApiCall, canRefresh]);

  // Function to summarize user profile based on chat history
  const summarizeProfile = useCallback(async (messages: Array<{ role: string; content: string }>, latestResponse: string): Promise<Profile> => {
    log('Summarizing profile', { messages, latestResponse });

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are an AI assistant specialized in analyzing conversations and extracting user profile information." },
          { role: "user", content: `Based on the following conversation, summarize the user's profile:\n${JSON.stringify(messages)}\nLatest AI response: ${latestResponse}\n\nProvide a summary in the following format:\nBrand:\nProduct:\nGoals:\nKPIs:\nBudget:` }
        ],
        max_tokens: 200,
        temperature: 0.5,
      });

      // Safe access to message content (fixes line 283)
      const summary = response.choices[0]?.message?.content || ''; 

      const profile: Profile = {
        brand: '',
        product: '',
        goals: '',
        kpis: '',
        budget: '',
      };

      summary.split('\n').forEach(line => {
        const [key, value] = line.split(':');
        if (key && value) {
          profile[key.toLowerCase().trim() as keyof Profile] = value.trim();
        }
      });

      log('Profile summarized', profile);
      return profile;
    } catch (err: any) {
      logError('Error summarizing profile', err);
      throw new Error(err.message || 'Failed to summarize profile');
    }
  }, [openai]);

  // Effect to fetch insights when data is available
  useEffect(() => {
    if (data.length > 0 && insights.length === 0) {
      log('Initial insights fetch');
      debouncedFetchInsights(data);
    }
  }, [data, insights, debouncedFetchInsights]);

  // Effect to set up periodic insights refresh
  useEffect(() => {
    const insightsFetchInterval = setInterval(() => {
      log('Periodic insights refresh');
      refreshInsights();
    }, INSIGHTS_REFRESH_INTERVAL);

    // Return a cleanup function to clear the interval on unmount
    return () => {
      log('Clearing insights fetch interval');
      clearInterval(insightsFetchInterval);
    };
  }, [refreshInsights]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    insights,
    isLoading,
    error,
    askQuestion,
    refreshInsights,
    lastRefreshTime,
    nextRefreshTime,
    summarizeProfile
  }), [insights, isLoading, error, askQuestion, refreshInsights, lastRefreshTime, nextRefreshTime, summarizeProfile]);

  return (
    <AIContext.Provider value={contextValue}>
      {children}
    </AIContext.Provider>
  );
};

export default AIProvider;