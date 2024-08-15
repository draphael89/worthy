'use client'

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useSession, signIn, signOut, SessionProvider } from 'next-auth/react';
import { FirebaseAuthService } from '../services/FirebaseAuthService';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  signIn: (provider: string, options?: any) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isEmailVerified: () => Promise<boolean>;
  sendVerificationEmail: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProviderContent: React.FC<AuthProviderProps> = ({ children }) => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (status === 'loading') {
      setLoading(true);
    } else {
      setUser(session?.user || null);
      setLoading(false);
    }
  }, [session, status]);

  const handleSignIn = async (provider: string, options?: any): Promise<void> => {
    try {
      await signIn(provider, options);
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error);
      throw error;
    }
  };

  const handleSignOut = async (): Promise<void> => {
    try {
      await FirebaseAuthService.signOut();
      await signOut({ callbackUrl: '/' });
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      await FirebaseAuthService.resetPassword(email);
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  };

  const isEmailVerified = async (): Promise<boolean> => {
    return await FirebaseAuthService.isEmailVerified();
  };

  const sendVerificationEmail = async (): Promise<void> => {
    if (user) {
      try {
        await FirebaseAuthService.sendVerificationEmail();
      } catch (error) {
        console.error('Error sending verification email:', error);
        throw error;
      }
    } else {
      throw new Error('No user is currently signed in');
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn: handleSignIn,
    signOut: handleSignOut,
    resetPassword,
    isEmailVerified,
    sendVerificationEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  return (
    <SessionProvider>
      <AuthProviderContent>{children}</AuthProviderContent>
    </SessionProvider>
  );
};