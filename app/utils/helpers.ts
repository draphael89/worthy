import { format, parse } from 'date-fns';

// Debug mode flag (set to true for development, false for production)
export const DEBUG_MODE = process.env.NODE_ENV === 'development';

// Custom logger function
export const logger = (message: string, data?: any) => {
  if (DEBUG_MODE) {
    console.log(`[DEBUG] ${message}`, data ? data : '');
  }
};

// Error logger function
export const errorLogger = (message: string, error: any) => {
  console.error(`[ERROR] ${message}`, error);
};

// Function to format date
export const formatDate = (date: Date | string | null | undefined): string | undefined => {
  if (!date) return undefined;
  try {
    if (typeof date === 'string') {
      if (date.includes('-')) {
        // If the date is already in 'yyyy-MM-dd' format, return it as is
        return date;
      }
      // If the date is in 'MMM dd' format, parse and format it
      const parsedDate = parse(date, 'MMM dd', new Date());
      return format(parsedDate, 'yyyy-MM-dd');
    }
    // If it's a Date object, format it
    return format(date, 'yyyy-MM-dd');
  } catch (error) {
    errorLogger('Error formatting date', error);
    return undefined;
  }
};

// Function to parse a date string to a Date object
export const parseDate = (dateString: string): Date | null => {
  if (!dateString) return null;
  try {
    const parsedDate = new Date(dateString);
    return isNaN(parsedDate.getTime()) ? null : parsedDate;
  } catch (error) {
    errorLogger(`Error parsing date: ${dateString}`, error);
    return null; // Return null if parsing fails
  }
};

// Function to format currency
export const formatCurrency = (amount: number): string => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    errorLogger('Error formatting currency', error);
    return amount.toString(); // Return raw number as string if formatting fails
  }
};

// Function to format large numbers
export const formatLargeNumber = (num: number): string => {
  try {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  } catch (error) {
    errorLogger('Error formatting large number', error);
    return num.toString(); // Return raw number as string if formatting fails
  }
};