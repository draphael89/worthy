'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Dashboard from './Dashboard';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme } from '@mui/material/styles';
import { ThemeType, lightTheme, darkTheme, toggleTheme } from '../styles/theme';
import LoadingSpinner from './LoadingSpinner';
import { FirebaseAuthService } from '../services/FirebaseAuthService';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';

export default function DashboardWrapper() {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>(lightTheme);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        const onboardingCompleted = await FirebaseAuthService.hasCompletedOnboarding(firebaseUser.uid);
        if (!onboardingCompleted) {
          router.push('/onboarding');
        }
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleToggleTheme = () => {
    setCurrentTheme((prevTheme) => toggleTheme(prevTheme));
  };

  const muiTheme = createTheme({
    palette: {
      mode: currentTheme === darkTheme ? 'dark' : 'light',
      primary: {
        main: currentTheme.primary,
      },
      secondary: {
        main: currentTheme.secondary,
      },
      text: {
        primary: currentTheme.text,
        secondary: currentTheme.textSecondary,
      },
      background: {
        default: currentTheme.background,
        paper: currentTheme.paper,
      },
    },
    typography: {
      fontFamily: currentTheme.fontFamily,
    },
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null;
  }

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Dashboard 
        darkMode={currentTheme === darkTheme} 
        onToggleTheme={handleToggleTheme}
      />
    </ThemeProvider>
  );
}