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
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { logger, errorLogger, formatDate, formatCurrency } from 'app/utils/helpers';
import { startOfWeek, subWeeks, format } from 'date-fns';
import { fetchAdData } from 'app/api/googleSheets';
import { AdData, DateRange, ViewMode } from '../types/AdData';
import ChartsContainer from './ChartsContainer';
import DateRangePicker from './DateRangePicker';
import ErrorBoundary from '../ErrorBoundary';
import AIChat from './AIChat';
import ProfileSection from './ProfileSection';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

const getDefaultDateRange = (): DateRange => {
  const end = new Date();
  const start = subWeeks(startOfWeek(end), 3);
  return {
    start: formatDate(start) ?? format(start, 'yyyy-MM-dd'),
    end: formatDate(end) ?? format(end, 'yyyy-MM-dd'),
  };
};

interface DashboardProps {
  darkMode: boolean;
}

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
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          {label}
          <Tooltip title={description} arrow>
            <IconButton size="small" sx={{ ml: 1 }}>
              <InfoIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
        </Typography>
        <Typography variant="h4" component="div" color="primary">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};

// Update the RootState interface to include the profile property
interface ExtendedRootState extends RootState {
  profile: {
    profile: any; // Replace 'any' with the actual type of your profile
  };
}

const Dashboard: React.FC<DashboardProps> = ({ darkMode }) => {
  const theme = useTheme();
  const [data, setData] = useState<AdData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange());
  const [viewMode, setViewMode] = useState<ViewMode>('weekly');

  // Update this line to use the ExtendedRootState type
  const profile = useSelector((state: ExtendedRootState) => state.profile.profile);

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
    return {
      totalSpend: formatCurrency(data.reduce((sum, item) => sum + item.spend, 0)),
      totalImpressions: data.reduce((sum, item) => sum + item.impressions, 0).toLocaleString(),
      cpm: formatCurrency(data.reduce((sum, item) => sum + item.cpm, 0) / data.length),
      totalClicks: data.reduce((sum, item) => sum + item.clicks, 0).toLocaleString(),
      ctr: `${((data.reduce((sum, item) => sum + item.clickThroughRate, 0) / data.length) * 100).toFixed(2)}%`,
      cpc: formatCurrency(data.reduce((sum, item) => sum + item.costPerLinkClick, 0) / data.length),
      totalInstalls: data.reduce((sum, item) => sum + item.appInstalls, 0).toLocaleString(),
      cpi: formatCurrency(data.reduce((sum, item) => sum + item.costPerAppInstall, 0) / data.length),
      totalRegistrations: data.reduce((sum, item) => sum + item.registrationsCompleted, 0).toLocaleString(),
      cpr: formatCurrency(data.reduce((sum, item) => sum + item.costPerRegistration, 0) / data.length),
      totalPurchases: data.reduce((sum, item) => sum + item.purchases, 0).toLocaleString(),
      cpp: formatCurrency(data.reduce((sum, item) => sum + item.costPerPurchase, 0) / data.length),
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
                  label="CPM"
                  value={summaryStats.cpm ?? 'N/A'}
                  description="Average cost per 1,000 ad impressions."
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
            <ChartsContainer
              dateRange={dateRange}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
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
            <Typography variant="h4" component="h1" gutterBottom>
              Facebook Ad Dashboard
            </Typography>
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