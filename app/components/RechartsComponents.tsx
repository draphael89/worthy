// RechartComponents.tsx
import React, { forwardRef, createElement, ForwardRefRenderFunction } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
  Label,
  ResponsiveContainerProps,
  LineProps,
  XAxisProps,
  YAxisProps,
  TooltipProps,
  CartesianGridProps,
  ReferenceAreaProps,
  ReferenceLineProps,
  LabelProps,
} from 'recharts';

// Wrapper for ResponsiveContainer
export const ChartResponsiveContainer: React.FC<ResponsiveContainerProps> = (props) => (
  <ResponsiveContainer {...props} />
);

// Wrapper for LineChart
export const ChartLineChart: React.FC<React.ComponentProps<typeof LineChart>> = (props) => (
  <LineChart {...props} />
);

// Wrapper for Line
const ChartLineComponent: ForwardRefRenderFunction<SVGPathElement, LineProps> = (props, ref) =>
  createElement(Line as any, { ...props, ref }); // Using 'as any' to bypass the type mismatch

export const ChartLine = forwardRef(ChartLineComponent);
ChartLine.displayName = 'ChartLine';

// Wrapper for XAxis
export const ChartXAxis: React.FC<XAxisProps> = (props) => (
  <XAxis {...props} />
);

// Wrapper for YAxis
export const ChartYAxis: React.FC<YAxisProps> = (props) => (
  <YAxis {...props} />
);

// Wrapper for Tooltip
const ChartTooltipComponent: ForwardRefRenderFunction<HTMLDivElement, TooltipProps<any, any>> = (props, ref) =>
  createElement(Tooltip as any, { ...props, ref }); // Using 'as any' to bypass the type mismatch

export const ChartTooltip = forwardRef(ChartTooltipComponent);
ChartTooltip.displayName = 'ChartTooltip';

// Wrapper for CartesianGrid
export const ChartCartesianGrid: React.FC<CartesianGridProps> = (props) => (
  <CartesianGrid {...props} />
);

// Wrapper for ReferenceArea
export const ChartReferenceArea: React.FC<ReferenceAreaProps> = (props) => (
  <ReferenceArea {...props} />
);

// Wrapper for ReferenceLine
export const ChartReferenceLine: React.FC<ReferenceLineProps> = (props) => (
  <ReferenceLine {...props} />
);

// Wrapper for Label
export const ChartLabel: React.FC<LabelProps> = (props) => (
  <Label {...props} />
);

// Custom tooltip component
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  formatter: (value: number) => string;
}

export const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, formatter }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: 'white',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '4px',
      }}>
        <p style={{ margin: 0 }}>{`Date: ${label}`}</p>
        <p style={{ margin: 0, color: payload[0].color }}>
          {`$ ${payload[0].name}: ${formatter(payload[0].value)}`}
        </p>
      </div>
    );
  }
  return null;
};