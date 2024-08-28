import React, { useState } from 'react';
import { List, DateInput, useListContext } from 'react-admin';
import ChartsContainer from './ChartsContainer';
import { DateRange, ViewMode } from '../types/AdData';

const DashboardFilters = [
  <DateInput key="startDate" source="startDate" alwaysOn />,
  <DateInput key="endDate" source="endDate" alwaysOn />,
];

export const DashboardList = () => (
  <List
    filters={DashboardFilters}
    perPage={100}
    pagination={false}
    component="div"
  >
    <DashboardContent />
  </List>
);

const DashboardContent = () => {
  const { isLoading } = useListContext();
  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [viewMode, setViewMode] = useState<ViewMode>('daily');

  const handleDateRangeChange = (newDateRange: DateRange) => {
    setDateRange(newDateRange);
  };

  const handleViewModeChange = (newViewMode: ViewMode) => {
    setViewMode(newViewMode);
  };
  
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <ChartsContainer 
        dateRange={dateRange}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
      />
    </div>
  );
};

export default DashboardList;