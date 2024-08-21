'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig'; // Adjust the import path as needed

// Define a custom type for the user
interface CustomUser extends User {
  onboardingCompleted?: boolean;
}

const DashboardContent: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<CustomUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        const userData = userDoc.data();

        setUser({
          ...firebaseUser,
          onboardingCompleted: userData?.onboardingCompleted ?? false,
        });

        if (!userData?.onboardingCompleted) {
          router.push('/onboarding');
        }
      } else {
        // User is signed out
        setUser(null);
        router.push('/login');
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div>
      <h1>Welcome to your Dashboard</h1>
      <p>Hello, {user.displayName || user.email || 'User'}!</p>
      {/* Add your dashboard content here */}
    </div>
  );
};

export default DashboardContent;