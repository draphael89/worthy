'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFormState } from 'react-dom';
import { authenticate, FormState } from '../actions/auth';
import styles from './SignIn.module.css';
import { signIn } from 'next-auth/react';

// Initial state for the form
const initialState: FormState = {
  message: null,
  success: false,
};

// Custom logger for client-side logging
const log = (message: string, data?: any) => {
  console.log(`[SignInContent] ${message}`, data ? JSON.stringify(data) : '');
};

const SignInContent: React.FC = () => {
  const router = useRouter();
  // Use useFormState to handle form submission and state updates
  const [state, formAction] = useFormState(authenticate, initialState);

  // Effect to handle successful authentication
  React.useEffect(() => {
    if (state.success) {
      log('Authentication successful, redirecting to dashboard');
      router.push('/dashboard');
    }
  }, [state.success, router]);

  // Handle form submission
  const handleSubmit = async (formData: FormData) => {
    log('Form submitted, calling authenticate action');
    await formAction(formData);
    
    // If server-side authentication was successful, perform client-side sign-in
    if (state.success) {
      log('Server-side authentication successful, performing client-side sign-in');
      try {
        const signInResult = await signIn('credentials', {
          redirect: false,
          email: formData.get('email') as string,
          password: formData.get('password') as string,
        });

        if (signInResult?.error) {
          log('Client-side sign-in failed', signInResult.error);
          // Update state with error message
          return {
            message: 'Failed to complete sign-in process. Please try again.',
            success: false,
          };
        }

        log('Client-side sign-in successful');
        // The useEffect will handle redirection
      } catch (error) {
        log('Error during client-side sign-in', error);
        // Update state with error message
        return {
          message: 'An unexpected error occurred during sign-in. Please try again.',
          success: false,
        };
      }
    }
  };

  return (
    <div className={styles.signInPage}>
      <div className={styles.formContainer}>
        <h1 className={styles.formTitle}>Sign In</h1>
        <form action={formAction} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className={styles.input}
              required
              aria-describedby="email-error"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className={styles.input}
              required
              aria-describedby="password-error"
            />
          </div>
          {state.message && (
            <p 
              className={state.success ? styles.success : styles.error}
              id={state.success ? 'form-success' : 'form-error'}
              aria-live="polite"
            >
              {state.message}
            </p>
          )}
          <button
            type="submit"
            className={styles.submitButton}
          >
            Sign In
          </button>
        </form>
        <p className={styles.signUpLink}>
          Don&apos;t have an account? <Link href="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default SignInContent;