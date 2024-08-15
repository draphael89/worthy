import { db } from 'app/firebase/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { OnboardingFormValues } from '../onboarding/OnboardingForm';

export const saveOnboardingData = async (userId: string, data: OnboardingFormValues) => {
  try {
    const onboardingRef = doc(db, 'onboarding', userId);
    await setDoc(onboardingRef, data);
    return { success: true };
  } catch (error) {
    console.error('Error saving onboarding data:', error);
    return { success: false, error: 'Failed to save onboarding data' };
  }
};

export const updateOnboardingStatus = async (userId: string, completed: boolean) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, { onboardingCompleted: completed }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error('Error updating onboarding status:', error);
    return { success: false, error: 'Failed to update onboarding status' };
  }
};