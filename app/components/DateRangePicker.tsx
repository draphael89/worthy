// src/components/DateRangePicker.tsx
import React from 'react';
import { TextField, Box } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateRange } from '../types/AdData';
import { format } from 'date-fns';

interface DateRangePickerProps {
  dateRange: DateRange;
  onDateRangeChange: (newDateRange: DateRange) => void;
  minDate: Date;
  maxDate: Date;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ dateRange, onDateRangeChange, minDate, maxDate }) => {
  const handleStartDateChange = (date: Date | null) => {
    if (date) {
      onDateRangeChange({
        ...dateRange,
        start: format(date, 'yyyy-MM-dd')
      });
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    if (date) {
      onDateRangeChange({
        ...dateRange,
        end: format(date, 'yyyy-MM-dd')
      });
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box display="flex" gap={2}>
        <DatePicker
          label="Start Date"
          value={new Date(dateRange.start)}
          onChange={handleStartDateChange}
          minDate={minDate}
          maxDate={new Date(dateRange.end)}
        />
        <DatePicker
          label="End Date"
          value={new Date(dateRange.end)}
          onChange={handleEndDateChange}
          minDate={new Date(dateRange.start)}
          maxDate={maxDate}
        />
      </Box>
    </LocalizationProvider>
  );
};

export default DateRangePicker;