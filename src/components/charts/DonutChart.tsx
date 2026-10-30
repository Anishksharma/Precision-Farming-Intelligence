import React from 'react';
import {
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';

export interface DonutChartProps {
  data: {
    name: string;
    value: number;
    color?: string;
  }[];
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  showLegend?: boolean;
}

const DEFAULT_COLORS = ['#FF8A24', '#B6F23A', '#54E38E', '#FFB547', '#FF4545', '#E8D44D'];

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  height = 260,
  innerRadius = 55,
  outerRadius = 85,
  showLegend = true,
}) => {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const entry = payload[0];
      return (
        <div
          className="rounded-lg border p-2 shadow-xl text-xs font-mono"
          style={{
            backgroundColor: '#171714',
            borderColor: '#34342B',
            color: '#F4F1E9',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.payload.fill }} />
            <span style={{ color: '#A6A69A' }}>{entry.name}:</span>
            <span className="font-bold" style={{ color: '#F4F1E9' }}>
              {entry.value}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <RechartsPieChart>
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              wrapperStyle={{
                paddingTop: 10,
                fontSize: 11,
                fontFamily: 'DM Mono',
                color: '#A6A69A',
              }}
            />
          )}
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={3}
            stroke="#171714"
            strokeWidth={2}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
              />
            ))}
          </Pie>
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};
