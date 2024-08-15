import { getFirestore, doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { UserProfile } from '../../app/types/UserProfile';

const db = getFirestore();

export const fetchUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userDocRef = doc(db, 'users', uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      // Type assertion to tell TypeScript that userData is of type UserProfile
      const userData = userDocSnap.data() as UserProfile; 

      return {
        ...userData,
        uid: userData.uid,
        email: userData.email,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        createdAt: userData.createdAt instanceof Timestamp ? userData.createdAt.toDate() : userData.createdAt,
        lastLoginAt: userData.lastLoginAt instanceof Timestamp ? userData.lastLoginAt.toDate() : userData.lastLoginAt,
        lastUpdated: userData.lastUpdated instanceof Timestamp ? userData.lastUpdated.toDate() : userData.lastUpdated,
        isEmailVerified: userData.isEmailVerified,
        phoneNumber: userData.phoneNumber,
        companyName: userData.companyName,
        jobTitle: userData.jobTitle,
        bio: userData.bio,
        location: userData.location,
        websiteUrl: userData.websiteUrl,
        socialLinks: userData.socialLinks,
        preferences: userData.preferences,
        adAccountId: userData.adAccountId,
        subscriptionTier: userData.subscriptionTier,
        brand: userData.brand,
        product: userData.product,
        goals: userData.goals,
        kpis: userData.kpis,
        budget: userData.budget,
      };
    } else {
      console.log('No such user document!');
      return null;
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const createUserProfile = async (uid: string, profile: Partial<UserProfile>): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', uid);
    const newProfile: UserProfile = {
      uid,
      email: profile.email || '',
      displayName: profile.displayName || null,
      photoURL: profile.photoURL || null,
      createdAt: new Date(),
      lastLoginAt: new Date(),
      isEmailVerified: profile.isEmailVerified || false,
      phoneNumber: profile.phoneNumber || null,
      lastUpdated: new Date(),
      companyName: profile.companyName,
      jobTitle: profile.jobTitle,
      bio: profile.bio,
      location: profile.location,
      websiteUrl: profile.websiteUrl,
      socialLinks: profile.socialLinks,
      preferences: profile.preferences,
      adAccountId: profile.adAccountId,
      subscriptionTier: profile.subscriptionTier,
      brand: profile.brand,
      product: profile.product,
      goals: profile.goals,
      kpis: profile.kpis,
      budget: profile.budget,
    };
    await setDoc(userDocRef, newProfile);
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, {
      ...updates,
      lastUpdated: new Date(),
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const deleteUserProfile = async (uid: string): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', uid);
    await setDoc(userDocRef, { deleted: true }, { merge: true });
  } catch (error) {
    console.error('Error deleting user profile:', error);
    throw error;
  }
};  