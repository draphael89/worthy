'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFormState } from 'react-dom';
import { signUp } from '../actions/auth';
import styles from './SignUp.module.css';

const initialState = {
  message: null,
  success: false,
};

const SignUpContent: React.FC = () => {
  const router = useRouter();
  const [state, formAction] = useFormState(signUp, initialState);

  useEffect(() => {
    if (state.success) {
      router.push('/onboarding');
    }
  }, [state.success, router]);

  return (
    <div className={styles.signUpPage}>
      <div className={styles.formContainer}>
        <h1 className={styles.formTitle}>Sign Up</h1>
        <form action={formAction} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className={styles.input}
              required
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
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className={styles.input}
              required
            />
          </div>
          {state.message && <p className={state.success ? styles.success : styles.error}>{state.message}</p>}
          <button
            type="submit"
            className={styles.submitButton}
          >
            Sign Up
          </button>
        </form>
        <p className={styles.signInLink}>
          Already have an account? <Link href="/signin">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpContent;