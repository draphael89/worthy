'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FirebaseAuthService } from '@/services/FirebaseAuthService';
import CoreOnboarding from './components/CoreOnboarding';
import ExtendedOnboarding from './components/ExtendedOnboarding';
import GradientBackground from './components/GradientBackground';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuth } from 'firebase/auth';
import { updateOnboardingStatus } from '../actions/auth';
import { OnboardingFormValues } from './types';
import { User } from 'firebase/auth';

const OnboardingContent: React.FC = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [onboardingData, setOnboardingData] = useState<Partial<OnboardingFormValues>>({});
  const [onboardingStage, setOnboardingStage] = useState<'core' | 'extended'>('core');

  useEffect(() => {
    const auth = getAuth();
    setUser(auth.currentUser);
    if (auth.currentUser) {
      FirebaseAuthService.getUserProfile(auth.currentUser.uid)
        .then((profile: Partial<OnboardingFormValues> | null) => {
          if (profile) {
            setOnboardingData(profile);
            if ('coreOnboardingCompleted' in profile && profile.coreOnboardingCompleted) {
              setOnboardingStage('extended');
            }
          }
        })
        .catch((error: Error) => {
          console.error('Error fetching user profile:', error);
        });
    }
  }, []);

  const handleCoreSubmit = async (values: Partial<OnboardingFormValues>) => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (!user) {
        throw new Error('No authenticated user found');
      }

      await FirebaseAuthService.updateUserProfile(user.uid, { ...values, coreOnboardingCompleted: true });
      setOnboardingData(prevData => ({ ...prevData, ...values, coreOnboardingCompleted: true }));
      setOnboardingStage('extended');
    } catch (error) {
      console.error('Error submitting core onboarding:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExtendedSubmit = async (values: Partial<OnboardingFormValues>) => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (!user) {
        throw new Error('No authenticated user found');
      }

      await FirebaseAuthService.updateUserProfile(user.uid, { ...values, extendedOnboardingCompleted: true });
      await updateOnboardingStatus(user.uid, true);
      router.push('/dashboard');
    } catch (error) {
      console.error('Error submitting extended onboarding:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GradientBackground>
      <div className="min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Welcome to Worthy AI
          </h1>
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4"
                role="alert"
              >
                <p className="font-bold">Error</p>
                <p>{error}</p>
              </motion.div>
            )}
          </AnimatePresence>
          {onboardingStage === 'core' ? (
            <CoreOnboarding 
              onSubmit={handleCoreSubmit} 
              isSubmitting={isSubmitting} 
              initialValues={onboardingData}
            />
          ) : (
            <ExtendedOnboarding 
              onSubmit={handleExtendedSubmit} 
              isSubmitting={isSubmitting} 
              initialValues={onboardingData}
            />
          )}
        </div>
      </div>
    </GradientBackground>
  );
};

export default OnboardingContent;