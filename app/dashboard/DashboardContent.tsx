'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';
import Dashboard from './Dashboard';
import LoadingSpinner from './LoadingSpinner';
import { Box, Container, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { ErrorBoundary } from 'react-error-boundary';

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
    return <LoadingSpinner />;
  }

  if (!user) {
    return null;
  }

  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Container maxWidth="xl">
          <Box my={4}>
            <Typography variant="h4" component="h1" gutterBottom>
              Welcome to your Dashboard
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              Hello, {user.displayName || user.email || 'User'}!
            </Typography>
            <Dashboard />
          </Box>
        </Container>
      </motion.div>
    </ErrorBoundary>
  );
};

const ErrorFallback: React.FC<{ error?: Error }> = ({ error }) => (
  <Box textAlign="center" my={4}>
    <Typography variant="h5" color="error" gutterBottom>
      Oops! Something went wrong.
    </Typography>
    <Typography variant="body1">
      {error?.message || 'An unexpected error occurred. Please try again later.'}
    </Typography>
  </Box>
);

export default DashboardContent;