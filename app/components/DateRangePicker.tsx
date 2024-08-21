// src/components/DateRangePicker.tsx
import React from 'react';
import { TextField, Box } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateRange } from '../types/AdData';

interface DateRangePickerProps {
  dateRange: DateRange;
  onDateRangeChange: (newDateRange: DateRange) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ dateRange, onDateRangeChange }) => {
  const handleStartDateChange = (date: Date | null) => {
    if (date) {
      onDateRangeChange({ ...dateRange, start: date.toISOString().split('T')[0] });
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    if (date) {
      onDateRangeChange({ ...dateRange, end: date.toISOString().split('T')[0] });
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box display="flex" gap={2}>
        <DatePicker
          label="Start Date"
          value={dateRange.start}
          onChange={handleStartDateChange}
          renderInput={(params) => <TextField {...params} />}
        />
        <DatePicker
          label="End Date"
          value={dateRange.end}
          onChange={handleEndDateChange}
          renderInput={(params) => <TextField {...params} />}
        />
      </Box>
    </LocalizationProvider>
  );
};

export default DateRangePicker;