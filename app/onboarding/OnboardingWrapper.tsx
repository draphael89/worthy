import { redirect } from 'next/navigation';
import { FirebaseAuthService } from '@/services/FirebaseAuthService';
import OnboardingContent from './OnboardingContent';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { log } from '../utils/logger';
import { useRouter } from 'next/router';

interface ExtendedUser {
  uid: string;
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
  onboardingCompleted?: boolean;
}

export default function OnboardingWrapper() {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      log('OnboardingWrapper', 'Auth state changed', { user: firebaseUser?.uid });
      if (firebaseUser) {
        setUser(firebaseUser);
        const onboardingCompleted = await FirebaseAuthService.hasCompletedOnboarding(firebaseUser.uid);
        if (onboardingCompleted) {
          log('OnboardingWrapper', 'Onboarding already completed, redirecting to dashboard');
          router.push('/dashboard');
        }
      } else {
        log('OnboardingWrapper', 'No authenticated user, redirecting to login');
        router.push('/login');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null; // The useEffect will redirect to login
  }

  log('OnboardingWrapper', 'Rendering OnboardingContent');
  return <OnboardingContent />;
}