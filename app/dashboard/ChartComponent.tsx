import React, { useMemo, useRef, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  ChartOptions,
  ChartData,
} from 'chart.js';
import { useTranslate } from 'react-admin';
import { Box, Card, CardContent, Typography, useTheme, useMediaQuery } from '@mui/material';
import { AdData } from '../types/AdData';
import {
  format,
  parseISO,
  startOfWeek,
  startOfMonth,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
} from 'date-fns';
import 'chartjs-adapter-date-fns';

// Register Chart.js elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const getDateRangeLabel = (dates: (string | undefined)[], viewMode: 'daily' | 'weekly' | 'monthly') => {
  if (dates.length === 0 || !dates[0] || !dates[dates.length - 1]) {
    return '';
  }

  const startDate = parseISO(dates[0] || '');
  const endDate = parseISO(dates[dates.length - 1] || '');

  switch (viewMode) {
    case 'daily':
      return `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`;
    case 'weekly':
      return `Week ${format(startDate, 'w, yyyy')} - Week ${format(endDate, 'w, yyyy')}`;
    case 'monthly':
      return `${format(startDate, 'MMMM yyyy')} - ${format(endDate, 'MMMM yyyy')}`;
    default:
      return ''; // Handle potential default case
  }
};

// Chart options with default parameter values
const getChartOptions = (
  title: string,
  yAxisLabel: string,
  formatter: (value: number) => string,
  darkMode: boolean,
  isMobile: boolean,
  dateRange: string,
  viewMode: string
): ChartOptions<'line'> => ({
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20,
    },
  },
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: [title, dateRange],
      color: darkMode ? 'rgba(255, 255, 255, 0.87)' : 'rgba(0, 0, 0, 0.87)',
      font: {
        size: isMobile ? 16 : 20,
        weight: 'bold',
      },
      padding: {
        top: 0,
        bottom: 16,
      },
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      backgroundColor: darkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
      titleColor: darkMode ? 'rgba(255, 255, 255, 0.87)' : 'rgba(0, 0, 0, 0.87)',
      bodyColor: darkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
      borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      borderWidth: 1,
      callbacks: {
        label: (context) => {
          const value = context.parsed.y;
          return `${context.dataset.label}: ${formatter(value)}`;
        },
      },
    },
  },
  scales: {
    x: {
      type: 'time',
      time: {
        unit: viewMode === 'daily' ? 'day' : viewMode === 'weekly' ? 'week' : 'month',
        displayFormats: {
          day: 'MMM d',
          week: 'MMM d', 
          month: 'MMM yyyy',
        },
        tooltipFormat: 'yyyy-MM-dd',
      },
      title: {
        display: true,
        text: 'Date',
        color: darkMode ? 'rgba(255, 255, 255, 0.87)' : 'rgba(0, 0, 0, 0.87)',
      },
      ticks: {
        color: darkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
      },
      grid: {
        color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      },
    },
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: yAxisLabel,
        color: darkMode ? 'rgba(255, 255, 255, 0.87)' : 'rgba(0, 0, 0, 0.87)',
      },
      ticks: {
        color: darkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
        callback: (value) => formatter(value as number),
      },
      grid: {
        color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      },
    },
  },
});

export interface ChartProps {
  data: AdData[];
  title: string;
  yAxisLabel: string;
  formatter: (value: number) => string;
  dataKey: keyof AdData;
  color: string;
  description?: string;
  dateRange: { start: string; end: string };
  viewMode: 'daily' | 'weekly' | 'monthly';
}

const ChartComponent: React.FC<ChartProps> = ({
  data,
  title,
  yAxisLabel,
  formatter,
  dataKey,
  color,
  description,
  dateRange,
  viewMode,
}) => {
  const translate = useTranslate();
  const theme = useTheme();
  const darkMode = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const chartRef = useRef<ChartJS | null>(null);

  const filteredData = useMemo(() => {
    return data.filter(
      (item) => item.date && item.date >= dateRange.start && item.date <= dateRange.end
    );
  }, [data, dateRange]);

  const chartData: ChartData<'line'> = useMemo(() => {
    let labels: Date[];
    let aggregatedData: { [key: string]: number };

    switch (viewMode) {
      case 'daily':
        labels = eachDayOfInterval({
          start: parseISO(dateRange.start),
          end: parseISO(dateRange.end),
        });
        aggregatedData = filteredData.reduce((acc, item) => {
          const date = format(parseISO(item.date!), 'yyyy-MM-dd');
          acc[date] = (acc[date] || 0) + (item[dataKey] as number);
          return acc;
        }, {} as { [key: string]: number });
        break;
      case 'weekly':
        labels = eachWeekOfInterval({
          start: parseISO(dateRange.start),
          end: parseISO(dateRange.end),
        });
        aggregatedData = filteredData.reduce((acc, item) => {
          const weekStart = format(startOfWeek(parseISO(item.date!)), 'yyyy-MM-dd');
          acc[weekStart] = (acc[weekStart] || 0) + (item[dataKey] as number);
          return acc;
        }, {} as { [key: string]: number });
        break;
      case 'monthly':
        labels = eachMonthOfInterval({
          start: parseISO(dateRange.start),
          end: parseISO(dateRange.end),
        });
        aggregatedData = filteredData.reduce((acc, item) => {
          const monthStart = format(startOfMonth(parseISO(item.date!)), 'yyyy-MM-dd');
          acc[monthStart] = (acc[monthStart] || 0) + (item[dataKey] as number);
          return acc;
        }, {} as { [key: string]: number });
        break;
      default:
        labels = [];
        aggregatedData = {};
        break;
    }

    return {
      labels,
      datasets: [
        {
          label: translate(title),
          data: labels.map((label) => aggregatedData[format(label, 'yyyy-MM-dd')] || 0),
          borderColor: color,
          backgroundColor: `${color}33`,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
  }, [filteredData, dateRange, viewMode, dataKey, color, title, translate]);

  const dateRangeLabel = useMemo(
    () => getDateRangeLabel([dateRange.start, dateRange.end], viewMode),
    [dateRange, viewMode]
  );

  const chartOptions = useMemo(
    () =>
      getChartOptions(
        translate(title),
        translate(yAxisLabel),
        formatter,
        darkMode,
        isMobile,
        dateRangeLabel,
        viewMode
      ),
    [
      title,
      yAxisLabel,
      formatter,
      darkMode,
      isMobile,
      dateRangeLabel,
      viewMode,
      translate,
    ]
  );

  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  if (!data || data.length === 0) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="400px"
        bgcolor={darkMode ? 'grey.800' : 'grey.100'}
        borderRadius="8px"
      >
        <Typography color={darkMode ? 'grey.400' : 'grey.500'} variant="h6">
          {translate('ra.message.no_data')}
        </Typography>
      </Box>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box height="400px">
          <Line
            options={chartOptions}
            data={chartData}
            ref={(element) => {
              if (element) {
                chartRef.current = element;
              }
            }}
          />
        </Box>
        {description && (
          <Typography variant="body2" color="textSecondary" mt={2}>
            {translate(description)}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default ChartComponent;