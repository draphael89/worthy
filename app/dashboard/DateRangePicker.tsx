// src/components/DateRangePicker.tsx
import React from 'react';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Box } from '@mui/material';
import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';

interface DateRangePickerProps {
  dateRange: { start: string; end: string };
  onDateRangeChange: (newDateRange: { start: string; end: string }) => void;
  minDate: Date;
  maxDate: Date;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  dateRange,
  onDateRangeChange,
  minDate,
  maxDate,
}) => {
  const handleStartDateChange = (date: Date | null) => {
    if (date) {
      onDateRangeChange({
        start: format(date, 'yyyy-MM-dd'),
        end: dateRange.end,
      });
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    if (date) {
      onDateRangeChange({
        start: dateRange.start,
        end: format(date, 'yyyy-MM-dd'),
      });
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <DatePicker
            label="Start Date"
            value={parseISO(dateRange.start)}
            onChange={handleStartDateChange}
            minDate={minDate}
            maxDate={parseISO(dateRange.end)}
            slotProps={{ textField: { size: 'small' } }}
          />
          <DatePicker
            label="End Date"
            value={parseISO(dateRange.end)}
            onChange={handleEndDateChange}
            minDate={parseISO(dateRange.start)}
            maxDate={maxDate}
            slotProps={{ textField: { size: 'small' } }}
          />
        </Box>
      </motion.div>
    </LocalizationProvider>
  );
};

export default DateRangePicker;