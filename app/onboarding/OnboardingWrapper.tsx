import { redirect } from 'next/navigation';
import { FirebaseAuthService } from '@/services/FirebaseAuthService';
import OnboardingContent from './OnboardingContent';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';

interface ExtendedUser {
  uid: string;
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
  onboardingCompleted?: boolean;
}

export default function OnboardingWrapper() {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const extendedUser: ExtendedUser = {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
        };
        setUser(extendedUser);

        const onboardingCompleted = await FirebaseAuthService.hasCompletedOnboarding(firebaseUser.uid);
        if (onboardingCompleted) {
          redirect('/dashboard');
        }
      } else {
        redirect('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Or a loading spinner component
  }

  if (!user) {
    return null; // This should not happen due to the redirect in useEffect, but TypeScript needs it
  }

  return <OnboardingContent />;
}