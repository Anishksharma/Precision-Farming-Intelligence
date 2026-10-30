import React from 'react';
import {
  ResponsiveContainer,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  Legend,
} from 'recharts';

export interface RadarChartProps {
  data: Record<string, unknown>[];
  series: {
    key: string;
    name?: string;
    color?: string;
  }[];
  subjectKey?: string;
  height?: number;
}

const DEFAULT_COLORS = ['#FF8A24', '#B6F23A', '#54E38E', '#FFB547'];

export const RadarChart: React.FC<RadarChartProps> = ({
  data,
  series,
  subjectKey = 'subject',
  height = 280,
}) => {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <RechartsRadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="#34342B" />
          <PolarAngleAxis
            dataKey={subjectKey}
            tick={{ fill: '#A6A69A', fontSize: 11, fontFamily: 'DM Mono' }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 'auto']}
            stroke="#6B6B60"
            tick={{ fill: '#6B6B60', fontSize: 10 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#171714',
              borderColor: '#34342B',
              borderRadius: '8px',
              fontFamily: 'DM Mono',
              fontSize: '12px',
              color: '#F4F1E9',
            }}
          />
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
              <Radar
                key={s.key}
                name={s.name || s.key}
                dataKey={s.key}
                stroke={color}
                fill={color}
                fillOpacity={0.3}
              />
            );
          })}
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
};
