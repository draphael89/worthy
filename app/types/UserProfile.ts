export interface UserProfile {
    uid: string;
    email: string;
    displayName: string | null;
    photoURL: string | null;
    createdAt: Date;
    lastLoginAt: Date;
    isEmailVerified: boolean;
    phoneNumber?: string | null; // Adjusted here to be optional
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
    brand?: string;
    product?: string;
    goals?: string;
    kpis?: string;
    budget?: number;
  }
  
  export type UserProfileUpdate = Partial<Omit<UserProfile, 'uid' | 'createdAt'>>;