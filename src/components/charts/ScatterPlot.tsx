import React from 'react';
import {
  ResponsiveContainer,
  ScatterChart as RechartsScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

export interface ScatterPlotProps {
  data: { x: number; y: number; z?: number; name?: string }[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  height?: number;
  color?: string;
}

export const ScatterPlot: React.FC<ScatterPlotProps> = ({
  data,
  xAxisLabel,
  yAxisLabel,
  height = 260,
  color = '#FF8A24',
}) => {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <RechartsScatterChart margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
          <CartesianGrid stroke="#34342B" strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="x"
            name={xAxisLabel || 'X'}
            stroke="#6B6B60"
            tick={{ fill: '#A6A69A', fontSize: 11, fontFamily: 'DM Mono' }}
            tickLine={false}
          />
          <YAxis
            type="number"
            dataKey="y"
            name={yAxisLabel || 'Y'}
            stroke="#6B6B60"
            tick={{ fill: '#A6A69A', fontSize: 11, fontFamily: 'DM Mono' }}
            tickLine={false}
          />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{
              backgroundColor: '#171714',
              borderColor: '#34342B',
              borderRadius: '8px',
              fontFamily: 'DM Mono',
              fontSize: '12px',
              color: '#F4F1E9',
            }}
          />
          <Scatter name="Points" data={data} fill={color} />
        </RechartsScatterChart>
      </ResponsiveContainer>
    </div>
  );
};
