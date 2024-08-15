import {
    DataProvider,
    GetListResult,
    GetOneResult,
    GetManyResult,
    GetManyReferenceResult,
    RaRecord,
    Identifier,
    GetListParams,
    GetOneParams,
    GetManyParams,
    GetManyReferenceParams,
  } from 'react-admin';
  import { LRUCache } from 'lru-cache';
  import { AdData } from '../../app/types/AdData';
  import { fetchAdData } from './googleSheets';
  import OpenAI from 'openai';
  import { Profile } from '../../app/types/ProfileTypes';
  import { logError, logInfo } from '../utils/logger';
  
  // Ensure you've installed the necessary dependencies:
  // npm install react-admin lru-cache openai
  
  type AdDataRecord = AdData & RaRecord<Identifier>;
  
  const cache = new LRUCache<string, AdDataRecord[]>({
    max: 100,
    ttl: 1000 * 60 * 5, // Cache for 5 minutes
  });
  
  const API_CALL_INTERVAL = 12000; // 12 seconds in milliseconds
  let lastApiCall = 0;
  
  const canMakeApiCall = (): boolean => {
    const now = Date.now();
    return now - lastApiCall >= API_CALL_INTERVAL;
  };
  
  const updateLastApiCall = (): void => {
    lastApiCall = Date.now();
  };
  
  const fetchAdDataWithCache = async (): Promise<AdDataRecord[]> => {
    const cacheKey = 'adData';
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey) || [];
    }
  
    try {
      const data = (await fetchAdData()).map((item: AdData) => ({ ...item, id: item.date }));
      cache.set(cacheKey, data);
      return data;
    } catch (error) {
      logError('Error fetching ad data', error);
      throw new Error('Failed to fetch ad data');
    }
  };
  
  const handleError = (error: unknown, operation: string): never => {
    logError(`Error in ${operation}:`, error);
    throw new Error(`Failed to ${operation}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  };
  
  const dataProviderImpl: DataProvider = {
    getList: async <RecordType extends RaRecord<Identifier> = AdDataRecord>(
      resource: string,
      params: GetListParams
    ): Promise<GetListResult<RecordType>> => {
      if (resource !== 'adData') {
        throw new Error(`Unknown resource: ${resource}`);
      }
  
      try {
        const { page = 1, perPage = 10 } = params.pagination || {};
        const { field = 'date', order = 'ASC' } = params.sort || {};
        const { filter = {} } = params;
  
        let data = await fetchAdDataWithCache();
  
        // Filtering (case-insensitive)
        data = data.filter((item) =>
          Object.entries(filter).every(([key, value]) =>
            String(item[key as keyof AdDataRecord]).toLowerCase().includes(String(value).toLowerCase())
          )
        );
  
        // Sorting
        const sortedData = data.sort((a, b) => {
          const aValue = a[field as keyof AdDataRecord];
          const bValue = b[field as keyof AdDataRecord];
          if (aValue < bValue) return order === 'ASC' ? -1 : 1;
          if (aValue > bValue) return order === 'ASC' ? 1 : -1;
          return 0;
        });
  
        const start = (page - 1) * perPage;
        const paginatedData = sortedData.slice(start, start + perPage);
  
        return {
          data: paginatedData as unknown as RecordType[],
          total: data.length,
        };
      } catch (error) {
        return handleError(error, 'get list');
      }
    },
  
    getOne: async <RecordType extends RaRecord<Identifier> = AdDataRecord>(
      resource: string,
      params: GetOneParams
    ): Promise<GetOneResult<RecordType>> => {
      if (resource !== 'adData') {
        throw new Error(`Unknown resource: ${resource}`);
      }
  
      try {
        const data = await fetchAdDataWithCache();
        const record = data.find((item) => item.id === params.id);
  
        if (!record) {
          throw new Error(`Record not found: ${params.id}`);
        }
  
        return { data: record as unknown as RecordType };
      } catch (error) {
        return handleError(error, 'get one');
      }
    },
  
    getMany: async <RecordType extends RaRecord<Identifier> = AdDataRecord>(
      resource: string,
      params: GetManyParams
    ): Promise<GetManyResult<RecordType>> => {
      if (resource !== 'adData') {
        throw new Error(`Unknown resource: ${resource}`);
      }
  
      try {
        const data = await fetchAdDataWithCache();
        const records = data.filter((item) => params.ids.includes(item.id));
  
        return { data: records as unknown as RecordType[] };
      } catch (error) {
        return handleError(error, 'get many');
      }
    },
  
    getManyReference: async <RecordType extends RaRecord<Identifier> = AdDataRecord>(
      resource: string,
      params: GetManyReferenceParams
    ): Promise<GetManyReferenceResult<RecordType>> => {
      if (resource !== 'adData') {
        throw new Error(`Unknown resource: ${resource}`);
      }
  
      try {
        const { page = 1, perPage = 10 } = params.pagination || {};
        const { field = 'date', order = 'ASC' } = params.sort || {};
  
        const data = await fetchAdDataWithCache();
        const filteredData = data.filter((item) => item[params.target as keyof AdDataRecord] === params.id);
  
        const sortedData = filteredData.sort((a, b) => {
          const aValue = a[field as keyof AdDataRecord];
          const bValue = b[field as keyof AdDataRecord];
          if (aValue < bValue) return order === 'ASC' ? -1 : 1;
          if (aValue > bValue) return order === 'ASC' ? 1 : -1;
          return 0;
        });
  
        const start = (page - 1) * perPage;
        const paginatedData = sortedData.slice(start, start + perPage);
  
        return {
          data: paginatedData as unknown as RecordType[],
          total: filteredData.length,
        };
      } catch (error) {
        return handleError(error, 'get many reference');
      }
    },
  
    create: async (): Promise<any> => {
      throw new Error('Create operation not supported');
    },
  
    update: async (): Promise<any> => {
      throw new Error('Update operation not supported');
    },
  
    updateMany: async (): Promise<any> => {
      throw new Error('UpdateMany operation not supported');
    },
  
    delete: async (): Promise<any> => {
      throw new Error('Delete operation not supported');
    },
  
    deleteMany: async (): Promise<any> => {
      throw new Error('DeleteMany operation not supported');
    },
  
    getCompletion: async (_resource: string, params: { prompt: string }) => {
      if (!canMakeApiCall()) {
        throw new Error('API call rate limited. Please wait before trying again.');
      }
  
      const openai = new OpenAI({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
      });
  
      try {
        const data = await fetchAdDataWithCache();
        const summarizedData = data.slice(0, 100).map((ad) => ({
          id: ad.id,
          date: ad.date,
          amountSpent: ad.amountSpent,
          impressions: ad.impressions,
          linkClicks: ad.linkClicks,
          purchases: ad.purchases,
        }));
  
        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are an AI assistant specialized in analyzing Facebook ad data.' },
            { role: 'user', content: `Question about Facebook ad data: ${params.prompt}\nContext: ${JSON.stringify(summarizedData)}` },
          ],
          max_tokens: 150,
          temperature: 0.7,
        });
  
        updateLastApiCall();
        return { data: response.choices[0]?.message?.content || '' };
      } catch (error) {
        return handleError(error, 'get completion');
      }
    },
  
    getChatCompletion: async (
      _resource: string,
      params: { messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>; latestResponse: string }
    ) => {
      if (!canMakeApiCall()) {
        throw new Error('API call rate limited. Please wait before trying again.');
      }
  
      const openai = new OpenAI({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
      });
  
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are an AI assistant specialized in analyzing conversations and extracting user profile information.' },
            ...params.messages,
            { role: 'assistant', content: params.latestResponse },
            { role: 'user', content: 'Based on our conversation, summarize my profile in the following format:\nBrand:\nProduct:\nGoals:\nKPIs:\nBudget:' },
          ],
          max_tokens: 200,
          temperature: 0.5,
        });
  
        const summary = response.choices[0]?.message?.content || '';
        const profile: Profile = {
          brand: '',
          product: '',
          goals: '',
          kpis: '',
          budget: '',
        };
  
        summary.split('\n').forEach((line: string) => {
          const [key, value] = line.split(':');
          if (key && value) {
            profile[key.toLowerCase().trim() as keyof Profile] = value.trim();
          }
        });
  
        updateLastApiCall();
        return { data: profile };
      } catch (error) {
        return handleError(error, 'get chat completion');
      }
    },
  
    // Add profile-related methods
    getProfile: async (): Promise<{ data: Profile }> => {
      // Implement profile fetching logic here (e.g., from database)
      // This is a placeholder implementation
      return { data: { brand: '', product: '', goals: '', kpis: '', budget: '' } };
    },
  
    updateProfile: async (_resource: string, params: { data: Partial<Profile> }): Promise<{ data: Profile }> => {
      // Implement profile updating logic here (e.g., update database)
      // This is a placeholder implementation
      logInfo('Updating profile', params.data);
      return { data: { ...params.data } as Profile };
    },
  };
  
  export const dataProvider: DataProvider = dataProviderImpl;