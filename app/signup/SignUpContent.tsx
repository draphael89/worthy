'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useFormState } from 'react-dom';
import { useRouter } from 'next/navigation';
import { signUp } from '../actions/auth';

const initialState = {
  message: null,
  success: false,
  userId: undefined,
  onboardingCompleted: false,
};

const SignUpContent: React.FC = () => {
  const router = useRouter();
  const [state, formAction] = useFormState(signUp, initialState);

  React.useEffect(() => {
    if (state.success) {
      router.push('/onboarding');
    }
  }, [state.success, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-hero-gradient-start to-hero-gradient-end p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-hero p-8 transform transition-all duration-300 ease-in-out hover:scale-105">
        <div className="flex justify-center mb-8">
          <Image src="/worthy-logo-2x.png" alt="Worthy Logo" width={150} height={50} />
        </div>
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Sign Up</h1>
        <form action={formAction} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-light transition-all duration-200"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-light transition-all duration-200"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-light transition-all duration-200"
            />
          </div>
          {state.message && (
            <p className={`text-sm ${state.success ? 'text-green-600' : 'text-red-600'} bg-opacity-10 p-2 rounded`}>
              {state.message}
            </p>
          )}
          <button
            type="submit"
            className="w-full bg-primary-light text-white font-bold py-2 px-4 rounded-md hover:bg-primary-dark transition-colors duration-200 transform hover:scale-105"
          >
            Get Started
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/signin" className="font-medium text-primary-light hover:text-primary-dark transition-colors duration-200">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpContent;