import { Message } from '../../app/types/ChatTypes';
import { Profile } from '../../app/types/ProfileTypes';
import { AIContextType } from 'app/contexts/AIContext';

// Logging function for debugging
const log = (message: string, data?: any) => {
  console.log(`[profileUtils] ${message}`, data);
};

/**
 * Summarizes the user profile based on chat messages and the latest AI response
 * @param messages Array of chat messages
 * @param latestResponse The latest AI response
 * @param aiContext The AI context containing the askQuestion function
 * @returns A Promise that resolves to an updated Profile object
 */
export const summarizeProfile = async (
  messages: Message[], 
  latestResponse: string, 
  aiContext: AIContextType
): Promise<Profile> => {
  const { askQuestion } = aiContext;

  const prompt = `Based on the following conversation, summarize the user's profile:
    ${messages.map(m => `${m.role}: ${m.content}`).join('\n')}
    AI: ${latestResponse}
    
    Provide a summary in the following format:
    Brand:
    Product:
    Goals:
    KPIs:
    Budget:`;

  try {
    log('Requesting profile summary');
    const summary = await askQuestion(prompt);
    log('Received profile summary', summary);

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
        const trimmedKey = key.toLowerCase().trim() as keyof Profile;
        if (trimmedKey in profile) {
          profile[trimmedKey] = value.trim();
        }
      }
    });

    log('Parsed profile', profile);
    return profile;
  } catch (error) {
    console.error('Error summarizing profile:', error);
    throw new Error('Failed to summarize profile');
  }
};

/**
 * Extracts key information from a profile
 * @param profile The user profile
 * @returns An object with key profile information
 */
export const extractKeyProfileInfo = (profile: Profile) => {
  return {
    // Use optional chaining (?.) to safely handle potentially undefined values
    primaryBrand: profile.brand?.split(',')[0]?.trim() || '', 
    primaryGoal: profile.goals?.split(',')[0]?.trim() || '',
    budgetRange: profile.budget || '',
  };
};

/**
 * Checks if a profile is complete (all fields have values)
 * @param profile The user profile
 * @returns A boolean indicating if the profile is complete
 */
export const isProfileComplete = (profile: Profile): boolean => {
  return Object.values(profile).every(value => value && value.trim() !== '');
};

/**
 * Generates a profile completion percentage
 * @param profile The user profile
 * @returns A number between 0 and 100 representing the completion percentage
 */
export const getProfileCompletionPercentage = (profile: Profile): number => {
  if (!profile) return 0;
  const totalFields = Object.keys(profile).length;
  const completedFields = Object.values(profile).filter(value => value && value.trim() !== '').length;
  return Math.round((completedFields / totalFields) * 100);
};

/**
 * Suggests next steps for completing the profile
 * @param profile The user profile
 * @returns An array of suggestions for completing the profile
 */
export const suggestProfileCompletionSteps = (profile: Profile): string[] => {
  const suggestions: string[] = [];
  Object.entries(profile).forEach(([key, value]) => {
    if (!value || value.trim() === '') {
      suggestions.push(`Please provide information about your ${key}.`);
    }
  });
  return suggestions;
};

/**
 * Merges a new profile with an existing profile, updating only non-empty fields
 * @param existingProfile The existing user profile
 * @param newProfile The new profile information to merge
 * @returns The merged Profile object
 */
export const mergeProfiles = (existingProfile: Profile, newProfile: Partial<Profile>): Profile => {
  const mergedProfile = { ...existingProfile };
  Object.entries(newProfile).forEach(([key, value]) => {
    if (value && value.trim() !== '') {
      mergedProfile[key as keyof Profile] = value.trim();
    }
  });
  return mergedProfile;
};

/**
 * Validates a profile object
 * @param profile The profile object to validate
 * @returns A boolean indicating if the profile is valid
 */
export const validateProfile = (profile: any): profile is Profile => {
  const requiredKeys: (keyof Profile)[] = ['brand', 'product', 'goals', 'kpis', 'budget'];
  return requiredKeys.every(key => typeof profile[key] === 'string');
};

const profileUtils = {
  summarizeProfile,
  extractKeyProfileInfo,
  isProfileComplete,
  getProfileCompletionPercentage,
  suggestProfileCompletionSteps,
  mergeProfiles,
  validateProfile,
};

export default profileUtils;