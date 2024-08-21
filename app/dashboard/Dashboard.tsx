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

const getDefaultDateRange = (): DateRange => {
  const end = new Date();
  const start = new Date(end.getFullYear(), end.getMonth(), 1); // First day of current month
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
};

const Dashboard: React.FC = () => {
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

  return (
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
                  <ProfileSection />
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
  );
};

export default Dashboard;