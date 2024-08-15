"use client";

import React from 'react';
import { ThemeProvider } from 'app/contexts/ThemeProvider';
import { AuthProvider } from 'app/contexts/AuthContext';
import { HelmetProvider } from 'react-helmet-async';

interface ClientProvidersProps {
  children: React.ReactNode;
}

const ClientProviders: React.FC<ClientProvidersProps> = ({ children }) => {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
};

export default ClientProviders;