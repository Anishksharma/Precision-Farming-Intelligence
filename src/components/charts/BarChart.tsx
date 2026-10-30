import React from 'react';
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export interface BarChartProps {
  data: Record<string, unknown>[];
  series: {
    key: string;
    name?: string;
    color?: string;
  }[];
  xAxisKey?: string;
  yAxisLabel?: string;
  height?: number;
  stacked?: boolean;
}

const DEFAULT_COLORS = ['#FF8A24', '#B6F23A', '#54E38E', '#FFB547', '#FF4545'];

export const BarChart: React.FC<BarChartProps> = ({
  data,
  series,
  xAxisKey = 'name',
  yAxisLabel,
  height = 260,
  stacked = false,
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="rounded-lg border p-2.5 shadow-xl text-xs font-mono"
          style={{
            backgroundColor: '#171714',
            borderColor: '#34342B',
            color: '#F4F1E9',
          }}
        >
          <p className="font-semibold mb-1 pb-1 border-b" style={{ borderColor: '#34342B' }}>
            {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center gap-2 my-0.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span style={{ color: '#A6A69A' }}>{entry.name}:</span>
              <span className="font-bold" style={{ color: '#F4F1E9' }}>
                {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <RechartsBarChart data={data} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
          <CartesianGrid stroke="#34342B" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey={xAxisKey}
            stroke="#6B6B60"
            tick={{ fill: '#A6A69A', fontSize: 11, fontFamily: 'DM Mono' }}
            tickLine={false}
          />
          <YAxis
            stroke="#6B6B60"
            tick={{ fill: '#A6A69A', fontSize: 11, fontFamily: 'DM Mono' }}
            tickLine={false}
            label={
              yAxisLabel
                ? { value: yAxisLabel, angle: -90, position: 'insideLeft', fill: '#A6A69A', fontSize: 10 }
                : undefined
            }
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{
              paddingTop: 10,
              fontSize: 11,
              fontFamily: 'DM Mono',
              color: '#A6A69A',
            }}
          />
          {series.map((s, idx) => {
            const color = s.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length];
            return (
              <Bar
                key={s.key}
                dataKey={s.key}
                name={s.name || s.key}
                fill={color}
                radius={[4, 4, 0, 0]}
                stackId={stacked ? 'stack' : undefined}
              />
            );
          })}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};
