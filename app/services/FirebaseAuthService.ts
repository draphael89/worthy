import {
  User,
  Auth,
  AuthError,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  UserCredential,
} from 'firebase/auth';
import { auth, db } from '../../app/firebase/firebaseConfig';
import { saveOnboardingData as saveFBOnboardingData, updateOnboardingStatus as updateFBOnboardingStatus } from '../../app/actions/onboarding';
import { OnboardingFormValues } from '../../app/onboarding/OnboardingForm';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export class FirebaseAuthService {
  private static auth: Auth = auth;

  private static logError(method: string, error: unknown): void {
    console.error(`[FirebaseAuthService] Error in ${method}:`, error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
  }

  private static logInfo(method: string, message: string): void {
    console.log(`[FirebaseAuthService] ${method}: ${message}`);
  }

  static async sendVerificationEmail(): Promise<void> {
    this.logInfo('sendVerificationEmail', 'Sending verification email');
    const user = this.getCurrentUser();
    if (!user) {
      throw new Error('No user is currently signed in');
    }
    try {
      await sendEmailVerification(user);
      this.logInfo('sendVerificationEmail', 'Verification email sent successfully');
    } catch (error: unknown) {
      this.logError('sendVerificationEmail', error);
      throw new Error('Failed to send verification email. Please try again later.');
    }
  }

  static async resetPassword(email: string): Promise<void> {
    this.logInfo('resetPassword', 'Attempting to send password reset email');
    try {
      await sendPasswordResetEmail(this.auth, email);
      this.logInfo('resetPassword', 'Password reset email sent successfully');
    } catch (error: unknown) {
      this.logError('resetPassword', error);
      throw this.handleAuthError(error, 'password reset');
    }
  }

  static getCurrentUser(): User | null {
    const user = this.auth.currentUser;
    this.logInfo('getCurrentUser', user ? `Current user: ${user.uid}` : 'No current user');
    return user;
  }

  static async isEmailVerified(): Promise<boolean> {
    this.logInfo('isEmailVerified', 'Checking email verification status');
    const user = this.getCurrentUser();
    if (!user) {
      this.logInfo('isEmailVerified', 'No user signed in');
      return false;
    }
    try {
      await user.reload(); // Refresh the user object to get the latest email verification status
      const isVerified = user.emailVerified;
      this.logInfo('isEmailVerified', isVerified ? 'Email is verified' : 'Email is not verified');
      return isVerified;
    } catch (error) {
      this.logError('isEmailVerified', error);
      throw new Error('Failed to check email verification status. Please try again later.');
    }
  }

  static async refreshUserToken(): Promise<string | null> {
    this.logInfo('refreshUserToken', 'Attempting to refresh user token');
    const user = this.getCurrentUser();
    if (!user) {
      this.logInfo('refreshUserToken', 'No user signed in, cannot refresh token');
      return null;
    }
    try {
      const token = await user.getIdToken(true);
      this.logInfo('refreshUserToken', 'Token refreshed successfully');
      return token;
    } catch (error) {
      this.logError('refreshUserToken', error);
      throw new Error('Failed to refresh user token. Please sign in again.');
    }
  }

  static async signInWithEmailAndPassword(email: string, password: string): Promise<UserCredential> {
    this.logInfo('signInWithEmailAndPassword', 'Attempting to sign in');
    try {
      const userCredential = await firebaseSignInWithEmailAndPassword(this.auth, email, password);
      this.logInfo('signInWithEmailAndPassword', 'Sign in successful');
      return userCredential;
    } catch (error) {
      this.logError('signInWithEmailAndPassword', error);
      throw this.handleAuthError(error, 'sign in');
    }
  }

  static async signUpWithEmailAndPassword(email: string, password: string): Promise<UserCredential> {
    this.logInfo('signUpWithEmailAndPassword', 'Attempting to sign up');
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      this.logInfo('signUpWithEmailAndPassword', 'Sign up successful');
      return userCredential;
    } catch (error) {
      this.logError('signUpWithEmailAndPassword', error);
      throw this.handleAuthError(error, 'sign up');
    }
  }

  static async signOut(): Promise<void> {
    this.logInfo('signOut', 'Attempting to sign out');
    try {
      await firebaseSignOut(this.auth);
      this.logInfo('signOut', 'Sign out successful');
    } catch (error) {
      this.logError('signOut', error);
      throw this.handleAuthError(error, 'sign out');
    }
  }

  static async saveOnboardingData(userId: string, data: OnboardingFormValues) {
    this.logInfo('saveOnboardingData', 'Attempting to save onboarding data');
    try {
      const result = await saveFBOnboardingData(userId, data);
      if (result.success) {
        await this.updateOnboardingStatus(userId, true);
        this.logInfo('saveOnboardingData', 'Onboarding data saved successfully');
      }
      return result;
    } catch (error) {
      this.logError('saveOnboardingData', error);
      return { success: false, error: 'Failed to save onboarding data' };
    }
  }

  static async updateOnboardingStatus(userId: string, completed: boolean) {
    this.logInfo('updateOnboardingStatus', `Updating onboarding status to ${completed}`);
    try {
      const result = await updateFBOnboardingStatus(userId, completed);
      this.logInfo('updateOnboardingStatus', 'Onboarding status updated successfully');
      return result;
    } catch (error) {
      this.logError('updateOnboardingStatus', error);
      return { success: false, error: 'Failed to update onboarding status' };
    }
  }

  static async hasCompletedOnboarding(userId: string): Promise<boolean> {
    this.logInfo('hasCompletedOnboarding', 'Checking onboarding status');
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      const onboardingCompleted = userDoc.exists() && userDoc.data()?.onboardingCompleted === true;
      this.logInfo('hasCompletedOnboarding', `Onboarding status: ${onboardingCompleted}`);
      return onboardingCompleted;
    } catch (error) {
      this.logError('hasCompletedOnboarding', error);
      return false;
    }
  }

  static async verifyToken(userId: string): Promise<boolean> {
    this.logInfo('verifyToken', 'Verifying user token');
    try {
      const user = this.getCurrentUser();
      if (user && user.uid === userId) {
        await user.getIdToken(true);
        this.logInfo('verifyToken', 'Token verified successfully');
        return true;
      }
      this.logInfo('verifyToken', 'Token verification failed');
      return false;
    } catch (error) {
      this.logError('verifyToken', error);
      return false;
    }
  }

  static async createUserInDatabase(userId: string, email: string) {
    this.logInfo('createUserInDatabase', 'Creating user in database');
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        email,
        onboardingCompleted: false,
        createdAt: new Date(),
      });
      this.logInfo('createUserInDatabase', 'User created in database successfully');
    } catch (error) {
      this.logError('createUserInDatabase', error);
      throw new Error('Failed to create user in database');
    }
  }

  private static handleAuthError(error: unknown, operation: string): Error {
    if (error instanceof Error) {
      const authError = error as AuthError;
      switch (authError.code) {
        case 'auth/invalid-email':
          return new Error('The email address is not valid. Please check and try again.');
        case 'auth/user-disabled':
          return new Error('This user account has been disabled. Please contact support.');
        case 'auth/user-not-found':
          return new Error('No user found with this email. Please check your email or sign up.');
        case 'auth/wrong-password':
          return new Error('Incorrect password. Please try again.');
        case 'auth/email-already-in-use':
          return new Error('This email is already in use. Please use a different email or try signing in.');
        case 'auth/weak-password':
          return new Error('The password is too weak. Please use a stronger password.');
        case 'auth/network-request-failed':
          return new Error('A network error occurred. Please check your connection and try again.');
        case 'auth/too-many-requests':
          return new Error('Too many unsuccessful attempts. Please try again later or reset your password.');
        case 'auth/operation-not-allowed':
          return new Error('This operation is not allowed. Please contact support.');
        default:
          return new Error(`An error occurred during ${operation} (${authError.code}). Please try again later.`);
      }
    }
    return new Error(`An unexpected error occurred during ${operation}.`);
  }
}