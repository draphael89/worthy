import React, { useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Tooltip as MuiTooltip,
  IconButton,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import {
  format,
  parseISO,
  startOfWeek,
  startOfMonth,
  isWithinInterval,
  subDays,
} from 'date-fns';
import { useDashboardContext } from './Dashboard';
import { ErrorBoundary } from 'react-error-boundary';
import { AdData, AdDataMetric, ViewMode } from '../types/AdData';
import logger from '../utils/logger';
import {
  ChartResponsiveContainer,
  ChartLineChart,
  ChartLine,
  ChartXAxis,
  ChartYAxis,
  ChartTooltip,
  ChartCartesianGrid,
  ChartReferenceArea,
  ChartReferenceLine,
  ChartLabel,
  CustomTooltip,
} from '../components/RechartsComponents';

const useProcessedData = (
  data: AdData[] = [],
  viewMode: ViewMode,
  dateRange: { start: string; end: string }
) => {
  return useMemo(() => {
    if (!data.length) {
      return [];
    }
    logger.info('Processing chart data', { dateRange, viewMode });

    const startDate = parseISO(dateRange.start);
    const endDate = parseISO(dateRange.end);

    const filteredData = data.filter((item) =>
      isWithinInterval(parseISO(item.date), { start: startDate, end: endDate })
    );

    let aggregatedData: { [key: string]: AdData } = {};

    const aggregateData = (acc: { [key: string]: AdData }, item: AdData, dateKey: string) => {
      if (!acc[dateKey]) {
        acc[dateKey] = { ...item, date: dateKey };
      } else {
        (Object.keys(item) as Array<keyof AdData>).forEach((key) => {
          const accItem = acc[dateKey]!;
          if (typeof item[key] === 'number' && typeof accItem[key] === 'number') {
            (accItem[key] as number) += (item[key] as number);
          }
        });
      }
      return acc;
    };

    switch (viewMode) {
      case 'daily':
        aggregatedData = filteredData.reduce((acc, item) => {
          const date = format(parseISO(item.date), 'yyyy-MM-dd');
          return aggregateData(acc, item, date);
        }, {} as { [key: string]: AdData });
        break;
      case 'weekly':
        aggregatedData = filteredData.reduce((acc, item) => {
          const weekStart = format(startOfWeek(parseISO(item.date)), 'yyyy-MM-dd');
          return aggregateData(acc, item, weekStart);
        }, {} as { [key: string]: AdData });
        break;
      case 'monthly':
        aggregatedData = filteredData.reduce((acc, item) => {
          const monthStart = format(startOfMonth(parseISO(item.date)), 'yyyy-MM-dd');
          return aggregateData(acc, item, monthStart);
        }, {} as { [key: string]: AdData });
        break;
    }

    return Object.values(aggregatedData).sort((a, b) => a.date.localeCompare(b.date));
  }, [data, viewMode, dateRange]);
};

interface ChartBoxProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

const ChartBox: React.FC<ChartBoxProps> = React.memo(({ children, title, description }) => (
  <Box mb={4} data-testid={`chart-box-${title.toLowerCase().replace(/\s+/g, '-')}`}>
    <Box display="flex" alignItems="center" mb={2}>
      <Typography variant="h6" component="h3">
        {title}
      </Typography>
      <MuiTooltip title={description} placement="right">
        <IconButton size="small" sx={{ ml: 1 }}>
          <InfoIcon fontSize="small" />
        </IconButton>
      </MuiTooltip>
    </Box>
    {children}
  </Box>
));

ChartBox.displayName = 'ChartBox';

interface ChartComponentProps {
  data: AdData[];
  title: string;
  yAxisLabel: string;
  formatter: (value: number) => string;
  dataKey: AdDataMetric;
  color: string;
}

const ChartComponent: React.FC<ChartComponentProps> = React.memo(
  ({ data, title, yAxisLabel, formatter, dataKey, color }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const getAverageValue = useCallback(() => {
      const sum = data.reduce((acc, item) => acc + (item[dataKey] as number), 0);
      return sum / data.length;
    }, [data, dataKey]);

    const averageValue = useMemo(() => getAverageValue(), [getAverageValue]);

    const getMinMaxDates = useCallback(() => {
      if (data.length === 0) {
        return { minDate: null, maxDate: null };
      }
      return {
        minDate: data[0]?.date,
        maxDate: data[data.length - 1]?.date,
      };
    }, [data]);

    const { minDate, maxDate } = useMemo(() => getMinMaxDates(), [getMinMaxDates]);

    return (
      <ChartResponsiveContainer width="100%" aspect={isMobile ? 1.5 : 2.5}>
        <ChartLineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
          <ChartCartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <ChartXAxis
            dataKey="date"
            tickFormatter={(date: string) => format(parseISO(date), 'dd MMM')}
            stroke={theme.palette.text.secondary}
            tick={{ fontSize: 12 }}
          />
          <ChartYAxis
            label={{
              value: yAxisLabel,
              angle: -90,
              position: 'insideLeft',
              fontSize: 12,
            }}
            tickFormatter={formatter}
            stroke={theme.palette.text.secondary}
            tick={{ fontSize: 12 }}
          />
          <ChartTooltip content={<CustomTooltip formatter={formatter} />} />
          <defs>
            <linearGradient id={`colorGradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.8} />
              <stop offset="95%" stopColor={color} stopOpacity={0.2} />
            </linearGradient>
          </defs>
          <ChartLine
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 8 }}
            name={title}
            fill={`url(#colorGradient-${dataKey})`}
            animationDuration={1500}
            animationEasing="ease-in-out"
          />
          <ChartReferenceLine y={averageValue} stroke={theme.palette.warning.main} strokeDasharray="3 3">
            <ChartLabel
              value="Average"
              position="insideBottomRight"
              fill={theme.palette.warning.main}
            />
          </ChartReferenceLine>
          {minDate && maxDate && (
            <ChartReferenceArea
              x1={minDate}
              x2={format(subDays(parseISO(maxDate), 7), 'yyyy-MM-dd')}
              fill={theme.palette.info.light}
              fillOpacity={0.1}
            />
          )}
        </ChartLineChart>
      </ChartResponsiveContainer>
    );
  }
);

ChartComponent.displayName = 'ChartComponent';

const ChartErrorFallback: React.FC<{ error: Error }> = ({ error }) => {
  logger.error('Chart rendering error', error);
  return (
    <Box>
      <Typography color="error">Error loading chart: {error.message}</Typography>
    </Box>
  );
};

const withErrorBoundary = (WrappedComponent: React.ComponentType<any>) => {
  const WithErrorBoundary = (props: any) => (
    <ErrorBoundary FallbackComponent={ChartErrorFallback}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );
  WithErrorBoundary.displayName = `WithErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  return WithErrorBoundary;
};

interface ChartProps {
  dataKey: AdDataMetric;
  title: string;
  yAxisLabel: string;
  color: string;
  formatter: (value: number) => string;
  description: string;
}

const Chart: React.FC<ChartProps> = ({
  dataKey,
  title,
  yAxisLabel,
  color,
  formatter,
  description,
}) => {
  const { data, viewMode, dateRange } = useDashboardContext();
  const processedData = useProcessedData(data, viewMode, dateRange);

  return (
    <ChartBox title={title} description={description}>
      {processedData.length > 0 ? (
        <ChartComponent
          data={processedData}
          title={title}
          yAxisLabel={yAxisLabel}
          formatter={formatter}
          dataKey={dataKey}
          color={color}
        />
      ) : (
        <Box display="flex" justifyContent="center" alignItems="center" height={300}>
          <CircularProgress />
        </Box>
      )}
    </ChartBox>
  );
};

export const AmountSpentChart = withErrorBoundary(() => (
  <Chart
    dataKey="amountSpent"
    title="Amount Spent"
    yAxisLabel="Amount ($)"
    color="rgb(75, 192, 192)"
    formatter={(value: number) => `$${value.toFixed(2)}`}
    description="Total amount spent on advertising during the selected period."
  />
));

export const CPMChart = withErrorBoundary(() => (
  <Chart
    dataKey="cpm"
    title="Cost Per Mille (CPM)"
    yAxisLabel="CPM ($)"
    color="rgb(255, 99, 132)"
    formatter={(value: number) => `$${value.toFixed(2)}`}
    description="Average cost per 1,000 ad impressions."
  />
));

export const CTRChart = withErrorBoundary(() => (
  <Chart
    dataKey="clickThroughRate"
    title="Click-Through Rate (CTR)"
    yAxisLabel="CTR (%)"
    color="rgb(54, 162, 235)"
    formatter={(value: number) => `${(value * 100).toFixed(2)}%`}
    description="Percentage of ad impressions that resulted in a click."
  />
));

export const CostPerLinkClickChart = withErrorBoundary(() => (
  <Chart
    dataKey="costPerLinkClick"
    title="Cost Per Link Click"
    yAxisLabel="Cost ($)"
    color="rgb(255, 159, 64)"
    formatter={(value: number) => `$${value.toFixed(2)}`}
    description="Average cost for each link click on your ads."
  />
));

export const CostPerPurchaseChart = withErrorBoundary(() => (
  <Chart
    dataKey="costPerPurchase"
    title="Cost Per Purchase"
    yAxisLabel="Cost ($)"
    color="rgb(153, 102, 255)"
    formatter={(value: number) => `$${value.toFixed(2)}`}
    description="Average cost for each purchase resulting from your ads."
  />
));

const chartComponents = {
  AmountSpentChart,
  CPMChart,
  CTRChart,
  CostPerLinkClickChart,
  CostPerPurchaseChart,
};

export default chartComponents;