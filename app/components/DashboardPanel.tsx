import React, { useState } from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { AmountSpentChart, CPMChart, CTRChart, CostPerLinkClickChart, CostPerPurchaseChart } from './Charts';
import DateRangePicker from './DateRangePicker';
import ViewModeSelector from './ViewModeSelector';
import { format, subWeeks, startOfWeek, endOfWeek } from 'date-fns';

const getDefaultDateRange = () => {
  const end = endOfWeek(new Date());
  const start = startOfWeek(subWeeks(end, 3));
  return {
    start: format(start, 'yyyy-MM-dd'),
    end: format(end, 'yyyy-MM-dd')
  };
};

interface DashboardPanelProps {
  darkMode: boolean;
  minDate: Date;
  maxDate: Date;
}

const DashboardPanel: React.FC<DashboardPanelProps> = ({ darkMode, minDate, maxDate }) => {
  const [dateRange, setDateRange] = useState(getDefaultDateRange());
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  const handleDateRangeChange = (newDateRange: { start: string; end: string }) => {
    setDateRange(newDateRange);
  };

  const handleViewModeChange = (newMode: 'daily' | 'weekly' | 'monthly') => {
    setViewMode(newMode);
  };

  return (
    <Card sx={{ bgcolor: darkMode ? 'grey.900' : 'background.paper', color: darkMode ? 'common.white' : 'text.primary' }}>
      <CardContent>
        <Typography variant="h4" gutterBottom>
          Facebook Ad Dashboard
        </Typography>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <ViewModeSelector viewMode={viewMode} onViewModeChange={handleViewModeChange} />
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
            minDate={minDate}
            maxDate={maxDate}
          />
        </Box>
        <AmountSpentChart dateRange={dateRange} viewMode={viewMode} />
        <CPMChart dateRange={dateRange} viewMode={viewMode} />
        <CTRChart dateRange={dateRange} viewMode={viewMode} />
        <CostPerLinkClickChart dateRange={dateRange} viewMode={viewMode} />
        <CostPerPurchaseChart dateRange={dateRange} viewMode={viewMode} />
      </CardContent>
    </Card>
  );
};

export default DashboardPanel;