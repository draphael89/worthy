import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { 
  AmountSpentChart, 
  CPMChart, 
  CTRChart, 
  CostPerLinkClickChart, 
  CostPerPurchaseChart 
} from './Charts';
import ViewModeSelector from './ViewModeSelector';
import { DateRange, ViewMode } from '../types/AdData';

interface ChartsContainerProps {
  dateRange: DateRange;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const ChartsContainer: React.FC<ChartsContainerProps> = ({ 
  dateRange, 
  viewMode, 
  onViewModeChange 
}) => {
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Performance Metrics</Typography>
        <ViewModeSelector viewMode={viewMode} onViewModeChange={onViewModeChange} />
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <AmountSpentChart dateRange={dateRange} viewMode={viewMode} />
        </Grid>
        <Grid item xs={12} md={6}>
          <CPMChart dateRange={dateRange} viewMode={viewMode} />
        </Grid>
        <Grid item xs={12} md={6}>
          <CTRChart dateRange={dateRange} viewMode={viewMode} />
        </Grid>
        <Grid item xs={12} md={6}>
          <CostPerLinkClickChart dateRange={dateRange} viewMode={viewMode} />
        </Grid>
        <Grid item xs={12}>
          <CostPerPurchaseChart dateRange={dateRange} viewMode={viewMode} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ChartsContainer;