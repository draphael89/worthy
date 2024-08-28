import { Card, CardContent, Box } from '@mui/material';
import { 
  AmountSpentChart, 
  CPMChart, 
  CTRChart, 
  CostPerLinkClickChart, 
  CostPerPurchaseChart 
} from './Charts';
import ViewModeSelector from '../components/ViewModeSelector';
import { useDashboardContext } from './Dashboard';
import { AdData, ViewMode, DateRange } from '../types/AdData';

// Update the DashboardContextType interface
interface DashboardContextType {
  data: AdData[];
  viewMode: ViewMode;
  dateRange: DateRange;
  setViewMode: (mode: ViewMode) => void;
}

const ChartsContainer = () => {
  const { viewMode, setViewMode, dateRange } = useDashboardContext();

  const handleViewModeChange = (newMode: 'daily' | 'weekly' | 'monthly') => {
    setViewMode(newMode);
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <ViewModeSelector viewMode={viewMode} onViewModeChange={handleViewModeChange} />
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

export default ChartsContainer;