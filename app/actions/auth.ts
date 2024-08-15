'use server';

import { z } from 'zod';
import { FirebaseAuthService } from '@/services/FirebaseAuthService';
import { doc, setDoc } from 'firebase/firestore';
import { db } from 'app/firebase/firebaseConfig';

// Define a schema for input validation
const authSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Define the shape of the form state
export type FormState = {
  message: string | null;
  success: boolean;
  userId?: string;
  onboardingCompleted?: boolean;
};

// Custom logger function that works on both client and server
const log = (message: string, data?: any) => {
  console.log(`[Auth Action] ${message}`, data ? JSON.stringify(data) : '');
};

/**
 * Authenticate a user with email and password
 * @param prevState - The previous form state
 * @param formData - The form data containing email and password
 * @returns FormState with the result of the authentication attempt
 */
export async function authenticate(prevState: FormState, formData: FormData): Promise<FormState> {
  log('Starting authentication process');

  const validatedFields = authSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    log('Validation failed', validatedFields.error);
    return {
      message: validatedFields.error.errors[0].message,
      success: false,
    };
  }

  const { email, password } = validatedFields.data;

  try {
    log('Attempting to authenticate user with Firebase');
    const userCredential = await FirebaseAuthService.signInWithEmailAndPassword(email, password);
    log('Firebase authentication successful', { userId: userCredential.user.uid });

    const onboardingCompleted = await FirebaseAuthService.hasCompletedOnboarding(userCredential.user.uid);
    log('Onboarding status checked', { onboardingCompleted });

    return {
      message: 'Authentication successful',
      success: true,
      userId: userCredential.user.uid,
      onboardingCompleted,
    };
  } catch (error) {
    log('Error authenticating', error);
    return {
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      success: false,
    };
  }
}

/**
 * Sign up a new user with email and password
 * @param prevState - The previous form state
 * @param formData - The form data containing email and password
 * @returns FormState with the result of the sign-up attempt
 */
export async function signUp(prevState: FormState, formData: FormData): Promise<FormState> {
  log('Starting sign-up process');

  const validatedFields = authSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    log('Validation failed', validatedFields.error);
    return {
      message: validatedFields.error.errors[0].message,
      success: false,
    };
  }

  const { email, password } = validatedFields.data;

  try {
    log('Attempting to create user with Firebase');
    const userCredential = await FirebaseAuthService.signUpWithEmailAndPassword(email, password);
    log('User created successfully', { userId: userCredential.user.uid });
    
    const userRef = doc(db, 'users', userCredential.user.uid);
    await setDoc(userRef, {
      email: email,
      onboardingCompleted: false,
      createdAt: new Date(),
    });
    log('User document created in Firestore');

    return {
      message: 'Sign up successful',
      success: true,
      userId: userCredential.user.uid,
      onboardingCompleted: false,
    };
  } catch (error) {
    log('Error signing up', error);
    return {
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      success: false,
    };
  }
}

/**
 * Check if a user has completed onboarding
 * @param userId - The user's ID
 * @returns A boolean indicating whether the user has completed onboarding
 */
export async function hasCompletedOnboarding(userId: string): Promise<boolean> {
  log('Checking onboarding status', { userId });
  try {
    const onboardingCompleted = await FirebaseAuthService.hasCompletedOnboarding(userId);
    log('Onboarding status retrieved', { userId, onboardingCompleted });
    return onboardingCompleted;
  } catch (error) {
    log('Error checking onboarding status', error);
    throw error;
  }
}

/**
 * Update the user's onboarding status
 * @param userId - The user's ID
 * @param status - The new onboarding status
 * @returns A boolean indicating whether the update was successful
 */
export async function updateOnboardingStatus(userId: string, status: boolean): Promise<boolean> {
  log('Updating onboarding status', { userId, status });
  try {
    await FirebaseAuthService.updateOnboardingStatus(userId, status);
    log('Onboarding status updated successfully', { userId, status });
    return true;
  } catch (error) {
    log('Error updating onboarding status', error);
    throw error;
  }
}