import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

export const updateOnboardingStatus = async (userId: string, completed: boolean) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { onboardingCompleted: completed });
};