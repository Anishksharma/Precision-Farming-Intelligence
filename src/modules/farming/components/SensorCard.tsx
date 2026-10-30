import React from 'react';
import type { Sensor } from '../../../types/farming';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Activity, Wifi, AlertTriangle } from 'lucide-react';
import { formatDate } from '../../../utils/formatUtils';

export interface SensorCardProps {
  sensor: Sensor;
  onOverrideValue?: (value: number) => void;
}

export const SensorCard: React.FC<SensorCardProps> = ({ sensor, onOverrideValue }) => {
  const percentInRange = Math.min(
    100,
    Math.max(0, ((sensor.currentValue - sensor.minRange) / (sensor.maxRange - sensor.minRange)) * 100)
  );

  const qualityBadgeVariants: Record<string, 'green' | 'lime' | 'amber' | 'red' | 'neutral'> = {
    excellent: 'green',
    good: 'lime',
    fair: 'amber',
    poor: 'red',
    unavailable: 'neutral',
  };

  const isAnomalous = sensor.currentValue < sensor.minRange || sensor.currentValue > sensor.maxRange;

  return (
    <Card padding="sm" className="space-y-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-mono font-semibold truncate capitalize" style={{ color: '#F4F1E9' }}>
            {sensor.type.replace(/_/g, ' ')}
          </p>
          <span className="text-[10px] font-mono" style={{ color: '#6B6B60' }}>
            ID: {sensor.id}
          </span>
        </div>

        <Badge variant={qualityBadgeVariants[sensor.quality] || 'neutral'} size="sm">
          {sensor.quality}
        </Badge>
      </div>

      {/* Main Metric Display */}
      <div className="flex items-baseline justify-between pt-1">
        <span
          className="font-mono text-2xl font-bold"
          style={{
            color: isAnomalous ? '#FF4545' : '#FF8A24',
          }}
        >
          {sensor.currentValue.toFixed(1)}
        </span>
        <span className="font-mono text-xs font-medium" style={{ color: '#A6A69A' }}>
          {sensor.unit}
        </span>
      </div>

      {/* Range Bar */}
      <div className="space-y-1">
        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#20201B' }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${percentInRange}%`,
              backgroundColor: isAnomalous ? '#FF4545' : '#B6F23A',
            }}
          />
        </div>
        <div className="flex justify-between text-[9px] font-mono" style={{ color: '#6B6B60' }}>
          <span>{sensor.minRange} {sensor.unit}</span>
          <span>{sensor.maxRange} {sensor.unit}</span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between pt-2 border-t text-[10px] font-mono" style={{ borderColor: '#282820', color: '#A6A69A' }}>
        <span className="flex items-center gap-1">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: sensor.status === 'active' ? '#54E38E' : '#FF4545' }}
          />
          {sensor.status.toUpperCase()}
        </span>
        <span>{formatDate(sensor.lastUpdate, 'time')}</span>
      </div>
    </Card>
  );
};
