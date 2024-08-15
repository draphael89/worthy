'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Dashboard from './Dashboard';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme } from '@mui/material/styles';
import { ThemeType, lightTheme, darkTheme, toggleTheme } from '../styles/theme';
import LoadingSpinner from './LoadingSpinner';
import { FirebaseAuthService } from '../services/FirebaseAuthService';

export default function DashboardWrapper() {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>(lightTheme);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    const checkAuthAndOnboarding = async () => {
      if (status === 'authenticated' && session?.user?.email) {
        const onboardingCompleted = await FirebaseAuthService.hasCompletedOnboarding(session.user.email);
        if (!onboardingCompleted) {
          router.push('/onboarding');
        }
      } else if (status === 'unauthenticated') {
        router.push('/login');
      }
    };

    checkAuthAndOnboarding();
  }, [status, session, router]);

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

  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  if (!session) {
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