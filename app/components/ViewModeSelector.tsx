import React from 'react';
import { ToggleButtonGroup, ToggleButton } from '@mui/material';

interface ViewModeSelectorProps {
  viewMode: 'daily' | 'weekly' | 'monthly';
  onViewModeChange: (newMode: 'daily' | 'weekly' | 'monthly') => void;
}

const ViewModeSelector: React.FC<ViewModeSelectorProps> = ({ viewMode, onViewModeChange }) => {
  const handleChange = (
    _: React.MouseEvent<HTMLElement>,
    newMode: 'daily' | 'weekly' | 'monthly' | null
  ) => {
    if (newMode !== null) {
      onViewModeChange(newMode);
    }
  };

  return (
    <ToggleButtonGroup
      value={viewMode}
      exclusive
      onChange={handleChange}
      aria-label="view mode"
      size="small"
    >
      <ToggleButton value="daily" aria-label="daily view">
        Daily
      </ToggleButton>
      <ToggleButton value="weekly" aria-label="weekly view">
        Weekly
      </ToggleButton>
      <ToggleButton value="monthly" aria-label="monthly view">
        Monthly
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export default ViewModeSelector;