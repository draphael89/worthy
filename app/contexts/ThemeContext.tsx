'use client';

import { createContext, useContext } from 'react';

export type ThemeMode = 'light' | 'dark';

export interface ThemeType {
  gradientColors: string[];
  particleColor: string;
  primary: string;
  secondary: string;
  text: string;
  background: string;
  fontFamily: string;
  textSecondary: string;
  paper: string;
  darkMode: boolean;
}

export interface ThemeContextType {
  theme: ThemeType;
  themeMode: ThemeMode;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};