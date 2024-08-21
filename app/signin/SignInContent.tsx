'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './SignIn.module.css';
import { FirebaseAuthService } from '../services/FirebaseAuthService';

// Custom logger for client-side logging
const log = (message: string, data?: any) => {
  console.log(`[SignInContent] ${message}`, data ? JSON.stringify(data) : '');
};

const SignInContent: React.FC = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    log('Form submitted, attempting to sign in');

    try {
      const user = await FirebaseAuthService.signInWithEmailAndPassword(email, password);
      log('Authentication successful, redirecting to dashboard');
      router.push('/dashboard');
    } catch (error) {
      log('Authentication failed', error);
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.signInPage}>
      <div className={styles.formContainer}>
        <h1 className={styles.formTitle}>Sign In</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
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
          {error && (
            <p 
              className={styles.error}
              id="form-error"
              aria-live="polite"
            >
              {error}
            </p>
          )}
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
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