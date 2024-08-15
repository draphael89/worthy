'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

// Define a custom type for the session user
interface CustomUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  onboardingCompleted?: boolean;
}

const DashboardContent: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/login');
    },
  });

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const user = session.user as CustomUser;
      if (user.onboardingCompleted === false) {
        router.push('/onboarding');
      }
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session?.user) {
    return null;
  }

  const user = session.user as CustomUser;

  return (
    <div>
      <h1>Welcome to your Dashboard</h1>
      <p>Hello, {user.name || 'User'}!</p>
      {/* Add your dashboard content here */}
    </div>
  );
};

export default DashboardContent;