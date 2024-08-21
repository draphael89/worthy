'use server';

import { z } from 'zod';
import { FirebaseAuthService } from '@/services/FirebaseAuthService';

const authSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type FormState = {
  message: string | null;
  success: boolean;
  userId?: string;
  onboardingCompleted?: boolean;
};

const log = (message: string, data?: any) => {
  console.log(`[Auth Action] ${message}`, data ? JSON.stringify(data) : '');
};

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
    const user = await FirebaseAuthService.signInWithEmailAndPassword(email, password);
    const onboardingCompleted = await FirebaseAuthService.hasCompletedOnboarding(user.uid);
    log('Firebase authentication successful', { userId: user.uid, onboardingCompleted });

    return {
      message: 'Authentication successful',
      success: true,
      userId: user.uid,
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
    const user = await FirebaseAuthService.signUpWithEmailAndPassword(email, password);
    await FirebaseAuthService.createUserInDatabase(user);
    log('User created successfully', { userId: user.uid });

    return {
      message: 'Sign up successful',
      success: true,
      userId: user.uid,
      onboardingCompleted: false, // Always set this to false for new users
    };
  } catch (error) {
    log('Error signing up', error);
    return {
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      success: false,
    };
  }
}

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