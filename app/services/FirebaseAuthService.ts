import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  User,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { OnboardingFormValues } from '../onboarding/types';

export class FirebaseAuthService {
  static auth = auth;

  static async signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  }

  static async signInWithEmailAndPassword(email: string, password: string) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      console.error('Error signing in with email and password:', error);
      throw error;
    }
  }

  static async signUpWithEmailAndPassword(email: string, password: string) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await this.createUserInDatabase(result.user);
      return result.user;
    } catch (error) {
      console.error('Error signing up with email and password:', error);
      throw error;
    }
  }

  static async signOut() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  static async sendPasswordResetEmail(email: string) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }

  static getCurrentUser(): User | null {
    return auth.currentUser;
  }

  static onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  static async createUserInDatabase(user: User) {
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        email: user.email,
        onboardingCompleted: false,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error('Error creating user in database:', error);
      throw error;
    }
  }

  static async hasCompletedOnboarding(userId: string): Promise<boolean> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      return userDoc.exists() && userDoc.data()?.onboardingCompleted === true;
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  }

  static async updateOnboardingStatus(userId: string, completed: boolean) {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, { onboardingCompleted: completed }, { merge: true });
    } catch (error) {
      console.error('Error updating onboarding status:', error);
      throw error;
    }
  }

  static async updateUserProfile(userId: string, data: any) {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, { ...data, onboardingCompleted: true }, { merge: true });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  static async getUserProfile(userId: string): Promise<Partial<OnboardingFormValues> | null> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        return userDoc.data() as Partial<OnboardingFormValues>;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }
}