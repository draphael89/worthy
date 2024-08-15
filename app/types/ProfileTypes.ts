// Define the structure of the user profile
export interface Profile {
    brand?: string;
    product?: string;
    goals?: string;
    kpis?: string;
    budget?: string;
  }
  
  // Define the action types for profile updates
  export const UPDATE_PROFILE = 'UPDATE_PROFILE';
  
  // Define the structure of the update profile action
  export interface UpdateProfileAction {
    type: typeof UPDATE_PROFILE;
    payload: Partial<Profile>;
  }
  
  // Define the structure of the reset profile action
  export interface ResetProfileAction {
    type: typeof UPDATE_PROFILE;
    payload: Profile; // Payload should match the initial state
  }
  
  // Define the structure of the update profile field action
  export interface UpdateProfileFieldAction {
    type: typeof UPDATE_PROFILE;
    payload: { [field in keyof Profile]: string }; // Use index signature
  }
  
  // Union type for all profile-related actions
  export type ProfileActionTypes = UpdateProfileAction | ResetProfileAction | UpdateProfileFieldAction;
  
  // Define the structure of the profile state in the Redux store
  export interface ProfileState extends Profile {
    lastUpdated: number | null;
  }
  
  // Define props for components that work with profiles (Optional - if needed)
  export interface ProfileProps {
    profile: Profile;
  }
  
  // Define the structure for profile update functions (Optional - if needed)
  export type ProfileUpdateFunction = (updates: Partial<Profile>) => void;
  
  // Define the structure for profile-related API responses (Optional - if you have a profile API)
  export interface ProfileApiResponse {
    success: boolean;
    data?: Profile;
    error?: string;
  }
  
  // Define the structure for profile summary requests (Optional - if needed)
  export interface ProfileSummaryRequest {
    messages: Array<{ role: string; content: string }>;
    latestResponse: string;
  }
  
  // Define the structure for profile summary responses (Optional - if needed)
  export interface ProfileSummaryResponse {
    summary: Profile;
  }
  
  // Define the structure of the user profile
  export interface UserProfile {
    uid: string;
    email: string;
    displayName: string | null;
    photoURL: string | null;
    createdAt: Date;
    lastLoginAt: Date;
    isEmailVerified: boolean;
    phoneNumber: string | null;
    companyName?: string;
    jobTitle?: string;
    bio?: string;
    location?: string;
    websiteUrl?: string;
    socialLinks?: {
      facebook?: string;
      twitter?: string;
      linkedin?: string;
      instagram?: string;
    };
    preferences?: {
      emailNotifications: boolean;
      darkMode: boolean;
      language: string;
    };
    adAccountId?: string;
    subscriptionTier?: 'free' | 'basic' | 'premium';
    lastUpdated: Date;
    // Add the missing properties
    brand?: string;
    product?: string;
    goals?: string;
    kpis?: string;
    budget?: number;
  }
  
  export type UserProfileUpdate = Partial<Omit<UserProfile, 'uid' | 'createdAt'>>;