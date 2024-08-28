'use client'

import React, { useState, useCallback } from 'react';
import {
  Box,
  Grid,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { DateRange, ViewMode } from 'app/types/AdData';
import ChartsContainer from '@/components/ChartsContainer';
import DateRangePicker from '@/components/DateRangePicker';
import ErrorBoundary from '@/ErrorBoundary';
import AIChat from '@/components/AIChat';
import ProfileSection from '@/components/ProfileSection';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { AdData } from '../types/AdData';

// At the top of the file
import { createContext, useContext } from 'react';

// Define the context type
interface DashboardContextType {
  data: AdData[];
  viewMode: ViewMode;
  dateRange: DateRange;
  setViewMode: (mode: ViewMode) => void;
}

// Create the context
const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// Create and export the hook
export const useDashboardContext = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboardContext must be used within a DashboardProvider');
  }
  return context;
};

const getDefaultDateRange = (): DateRange => {
  const end = new Date();
  const start = new Date(end.getFullYear(), end.getMonth(), 1); // First day of current month
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
};

interface DashboardProps {
  darkMode: boolean;
  onToggleTheme: () => void;
}

// Update the RootState interface to include the profile property
interface ExtendedRootState extends RootState {
  profile: {
    profile: any; // Replace 'any' with the actual type of your profile
  };
}

const Dashboard: React.FC<DashboardProps> = ({ darkMode, onToggleTheme }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange());
  const [viewMode, setViewMode] = useState<ViewMode>('daily');

  const handleDateRangeChange = useCallback((newDateRange: DateRange) => {
    setDateRange(newDateRange);
  }, []);

  const handleViewModeChange = useCallback((newViewMode: ViewMode) => {
    setViewMode(newViewMode);
  }, []);

  // Update this line to use the ExtendedRootState type
  const profile = useSelector((state: ExtendedRootState) => state.profile.profile);

  return (
    <DashboardContext.Provider value={{
      data: [], // Add your actual data here
      viewMode,
      dateRange,
      setViewMode: handleViewModeChange
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
              <ErrorBoundary>
                <Box mb={2}>
                  <DateRangePicker
                    dateRange={dateRange}
                    onDateRangeChange={handleDateRangeChange}
                    minDate={new Date(2020, 0, 1)} // Add an appropriate min date
                    maxDate={new Date()} // Add an appropriate max date
                  />
                </Box>
                <ChartsContainer
                  dateRange={dateRange}
                  viewMode={viewMode}
                  onViewModeChange={handleViewModeChange}
                />
              </ErrorBoundary>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Grid container direction={isMobile ? 'row' : 'column'} spacing={3}>
              <Grid item xs={12}>
                <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
                  <ErrorBoundary>
                    <ProfileSection profile={profile} />
                  </ErrorBoundary>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper elevation={3} sx={{ p: 2, height: '100%', minHeight: 300 }}>
                  <ErrorBoundary>
                    <AIChat />
                  </ErrorBoundary>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </motion.div>
    </DashboardContext.Provider>
  );
};

export default Dashboard;