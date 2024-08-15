'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import styles from '../components/auth/SignUp.module.css';

type FormInputs = {
  email: string;
  password: string;
};

const SignInPage: React.FC = () => {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors }, setError } = useForm<FormInputs>();

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        setError('root', { type: 'manual', message: result.error });
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error signing in:', error);
      setError('root', { type: 'manual', message: 'An unexpected error occurred' });
    }
  };

  return (
    <div className={styles.signUpPage}>
      <div className={styles.formContainer}>
        <h1 className={styles.formTitle}>Sign In</h1>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input
              id="email"
              {...register('email', { required: 'Email is required' })}
              type="email"
              className={styles.input}
              placeholder="Enter your email"
            />
            {errors.email && <p className={styles.error}>{errors.email.message}</p>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input
              id="password"
              {...register('password', { required: 'Password is required' })}
              type="password"
              className={styles.input}
              placeholder="Enter your password"
            />
            {errors.password && <p className={styles.error}>{errors.password.message}</p>}
          </div>

          {errors.root && <p className={styles.error} role="alert">{errors.root.message}</p>}

          <div className={styles.buttonGroup}>
            <button
              type="submit"
              className={`${styles.button} ${styles.submitButton}`}
            >
              Sign In
            </button>
          </div>
        </form>
        <p className={styles.switchAuthMode}>
          Don&apos;t have an account? <Link href="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default SignInPage;