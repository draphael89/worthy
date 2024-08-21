'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { FirebaseAuthService } from '../services/FirebaseAuthService';
import LandingPage from './LandingPage';

const AuthCheck: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    const checkUserStatus = async () => {
      if (!loading && user) {
        const completed = await FirebaseAuthService.hasCompletedOnboarding(user.uid);
        setOnboardingCompleted(completed);
        if (completed) {
          router.push('/dashboard');
        } else if (pathname !== '/onboarding') {
          router.push('/onboarding');
        }
      }
    };

    checkUserStatus();
  }, [user, loading, router, pathname]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <LandingPage />;
  }

  if (onboardingCompleted === null) {
    return <div>Checking user status...</div>;
  }

  return null;
};

export default AuthCheck;