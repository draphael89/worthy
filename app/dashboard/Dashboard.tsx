'use client'

import React, { useState, useEffect, useMemo, useCallback, createContext, useContext } from 'react';
import {
  Box,
  Typography,
  Grid,
  Skeleton,
  Card,
  CardContent,
  Tooltip,
  IconButton,
  Fade,
  Paper,
  useTheme,
  Button,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { logger, errorLogger, formatDate, formatCurrency } from 'app/utils/helpers';
import { startOfWeek, subWeeks, format } from 'date-fns';
import { fetchAdData } from 'app/api/googleSheets';
import { AdData, DateRange, ViewMode } from 'app/types/AdData';
import ChartsContainer from '@/components/ChartsContainer';
import DateRangePicker from '@/components/DateRangePicker';
import ErrorBoundary from '@/ErrorBoundary';
import AIChat from '@/components/AIChat';
import ProfileSection from '@/components/ProfileSection';
import { useSelector } from 'react-redux';
import { RootState } from 'app/redux/store';

const getDefaultDateRange = (): DateRange => {
  const end = new Date();
  const start = subWeeks(startOfWeek(end), 3);
  return {
    start: formatDate(start) ?? format(start, 'yyyy-MM-dd'),
    end: formatDate(end) ?? format(end, 'yyyy-MM-dd'),
  };
};

interface DashboardContextValue {
  data: AdData[];
  dateRange: DateRange;
  viewMode: ViewMode;
  setDateRange: (range: DateRange) => void;
  setViewMode: (mode: ViewMode) => void;
  darkMode: boolean;
}

const DashboardContext = createContext<DashboardContextValue | undefined>(undefined);

export const useDashboardContext = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboardContext must be used within a DashboardProvider');
  }
  return context;
};

interface SummaryStatisticProps {
  label: string;
  value: string | number;
  description: string;
}

const SummaryStatistic: React.FC<SummaryStatisticProps> = ({ label, value, description }) => {
  const theme = useTheme();

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" component="div">
          {label}
          <Tooltip title={description} arrow>
            <IconButton size="small" sx={{ ml: 1 }}>
              <InfoIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
        </Typography>
        <Typography variant="h4" component="div" sx={{ mt: 2, mb: 1 }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};

interface DashboardProps {
  darkMode: boolean;
  onToggleTheme: () => void; // Add this line
}

const Dashboard: React.FC<DashboardProps> = ({ darkMode, onToggleTheme }) => {
  const theme = useTheme();
  const [data, setData] = useState<AdData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange());
  const [viewMode, setViewMode] = useState<ViewMode>('weekly');

  const profile = useSelector((state: RootState) => state.profile);

  const filterData = useCallback((data: AdData[], range: DateRange): AdData[] => {
    logger('Filtering data', { dateRange: range, dataLength: data.length });
    return data.filter((item) => item.date >= range.start && item.date <= range.end);
  }, []);

  useEffect(() => {
    const fetchDataFromAPI = async () => {
      try {
        setIsLoading(true);
        logger('Fetching data from API', { dateRange });

        const fetchedData = await fetchAdData();

        logger('Data fetched successfully', { rowCount: fetchedData.length });

        const filteredData = filterData(fetchedData, dateRange);
        logger('Data filtered', {
          totalRows: fetchedData.length,
          filteredRows: filteredData.length,
          filteredSample: filteredData.slice(0, 5),
        });

        setData(filteredData);
        setError(null);
      } catch (error) {
        errorLogger('Error fetching data:', error);
        setError('Failed to fetch data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDataFromAPI();
  }, [dateRange, filterData]);

  const summaryStats = useMemo(() => {
    if (data.length === 0) return {};

    const totalSpend = data.reduce((sum, item) => sum + item.spend, 0);
    const totalImpressions = data.reduce((sum, item) => sum + item.impressions, 0);
    const totalClicks = data.reduce((sum, item) => sum + item.clicks, 0);
    const totalInstalls = data.reduce((sum, item) => sum + item.installs, 0);
    const totalRegistrations = data.reduce((sum, item) => sum + item.registrations, 0);
    const totalPurchases = data.reduce((sum, item) => sum + item.purchases, 0);

    return {
      totalSpend: formatCurrency(totalSpend),
      totalImpressions: totalImpressions.toLocaleString(),
      totalClicks: totalClicks.toLocaleString(),
      ctr: `${((totalClicks / totalImpressions) * 100).toFixed(2)}%`,
      cpc: formatCurrency(totalSpend / totalClicks),
      totalInstalls: totalInstalls.toLocaleString(),
      cpi: formatCurrency(totalSpend / totalInstalls),
      totalRegistrations: totalRegistrations.toLocaleString(),
      cpr: formatCurrency(totalSpend / totalRegistrations),
      totalPurchases: totalPurchases.toLocaleString(),
      cpp: formatCurrency(totalSpend / totalPurchases),
    };
  }, [data]);

  const dashboardContextValue: DashboardContextValue = {
    data,
    dateRange,
    viewMode,
    setDateRange,
    setViewMode,
    darkMode,
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <Grid container spacing={3}>
          {[...Array(12)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Skeleton variant="rectangular" height={100} animation="wave" />
            </Grid>
          ))}
        </Grid>
      );
    }

    if (error) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
          <Typography color="error">{error}</Typography>
        </Box>
      );
    }

    return (
      <Fade in={!isLoading}>
        <Grid container spacing={3} mt={2}>
          <Grid item xs={12}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <SummaryStatistic
                  label="Total Spend"
                  value={summaryStats.totalSpend ?? 'N/A'}
                  description="Total amount spent on advertising during the selected period."
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <SummaryStatistic
                  label="Impressions"
                  value={summaryStats.totalImpressions ?? 'N/A'}
                  description="Total number of times your ads were displayed."
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <SummaryStatistic
                  label="Clicks"
                  value={summaryStats.totalClicks ?? 'N/A'}
                  description="Total number of clicks on your ads."
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <SummaryStatistic
                  label="Click Through Rate"
                  value={summaryStats.ctr ?? 'N/A'}
                  description="Percentage of ad impressions that resulted in a click."
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <SummaryStatistic
                  label="Cost per Click"
                  value={summaryStats.cpc ?? 'N/A'}
                  description="Average cost for each click on your ads."
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <SummaryStatistic
                  label="Installs"
                  value={summaryStats.totalInstalls ?? 'N/A'}
                  description="Total number of app installations resulting from your ads."
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <SummaryStatistic
                  label="Cost per Install"
                  value={summaryStats.cpi ?? 'N/A'}
                  description="Average cost for each app installation."
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <SummaryStatistic
                  label="Registrations"
                  value={summaryStats.totalRegistrations ?? 'N/A'}
                  description="Total number of user registrations resulting from your ads."
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <SummaryStatistic
                  label="Cost per Registration"
                  value={summaryStats.cpr ?? 'N/A'}
                  description="Average cost for each user registration."
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <SummaryStatistic
                  label="Purchases"
                  value={summaryStats.totalPurchases ?? 'N/A'}
                  description="Total number of purchases resulting from your ads."
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <SummaryStatistic
                  label="Cost per Purchase"
                  value={summaryStats.cpp ?? 'N/A'}
                  description="Average cost for each purchase."
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <ChartsContainer />
          </Grid>
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h5" gutterBottom>AI Assistant</Typography>
              <AIChat />
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h5" gutterBottom>User Profile</Typography>
              <ProfileSection profile={profile} />
            </Paper>
          </Grid>
        </Grid>
      </Fade>
    );
  };

  return (
    <ErrorBoundary>
      <DashboardContext.Provider value={dashboardContextValue}>
        <Box
          sx={{
            p: 4,
            minHeight: '100vh',
            transition: 'background-color 0.3s, color 0.3s',
            backgroundColor: darkMode ? theme.palette.grey[900] : theme.palette.grey[100],
            color: darkMode ? theme.palette.common.white : theme.palette.common.black,
          }}
        >
          <Box maxWidth="1200px" margin="auto">
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h4" component="h1">
                Facebook Ad Dashboard
              </Typography>
              <Button
                onClick={onToggleTheme}
                color="inherit"
                startIcon={darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
              >
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </Button>
            </Box>
            <DateRangePicker
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              minDate={new Date(2020, 0, 1)}
              maxDate={new Date()}
            />
            {renderContent()}
          </Box>
        </Box>
      </DashboardContext.Provider>
    </ErrorBoundary>
  );
};

export default Dashboard;