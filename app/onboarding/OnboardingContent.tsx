'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FirebaseAuthService } from '@/services/FirebaseAuthService';
import QuestionFlow from './components/QuestionFlow';
import GradientBackground from './components/GradientBackground';
import { motion, AnimatePresence } from 'framer-motion';

export interface OnboardingFormValues {
  companyName: string;
  website: string;
  industry: string;
  adSpend: number;
  adChannels: string[];
  otherAdChannel?: string;
  primaryGoal: string;
  targetAudience: string;
  audienceDescription: string;
  mainKPI: string;
  otherKPI?: string;
  currentPerformance: string;
  targetPerformance: string;
  mainChallenge: string;
  otherChallenge?: string;
  primaryAdPlatform: string;
  otherAdPlatform?: string;
  primaryAnalyticsTool: string;
  otherAnalyticsTool?: string;
}

const OnboardingContent: React.FC = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: OnboardingFormValues) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await FirebaseAuthService.saveOnboardingData(values.companyName, values);
      
      if (result.success) {
        await FirebaseAuthService.updateOnboardingStatus(values.companyName, true);
        router.push('/dashboard');
      } else {
        setError(result.error || 'An error occurred while saving onboarding data');
      }
    } catch (error) {
      console.error('Error submitting onboarding form:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GradientBackground>
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="absolute top-0 left-0 right-0 bg-red-100 border-b border-red-400 text-red-700 px-4 py-3 z-50"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
            <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
              <svg
                className="fill-current h-6 w-6 text-red-500"
                role="button"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                onClick={() => setError(null)}
              >
                <title>Close</title>
                <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
              </svg>
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      <QuestionFlow onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </GradientBackground>
  );
};

export default OnboardingContent;