import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { MetricItem } from '../../types';

export interface MetricCardProps {
  metric?: MetricItem;
  title?: string;
  value?: string | number;
  unit?: string;
  change?: number;
  changeDirection?: 'up' | 'down' | 'stable';
  source?: 'extracted' | 'calculated' | 'estimated';
  glow?: 'none' | 'orange' | 'lime' | 'red';
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  metric,
  title,
  value,
  unit,
  change,
  changeDirection,
  source,
  glow = 'none',
  className = '',
}) => {
  const displayTitle = title || metric?.label || 'Metric';
  const displayValue = value !== undefined ? value : metric?.value !== undefined ? metric.value : '--';
  const displayUnit = unit || metric?.unit || '';
  const displayChange = change !== undefined ? change : metric?.change;
  const displayDirection = changeDirection || metric?.changeDirection || (displayChange && displayChange > 0 ? 'up' : displayChange && displayChange < 0 ? 'down' : 'stable');
  const displaySource = source || metric?.source || 'calculated';

  const sourceBadges = {
    extracted: { label: 'Extracted Fact', variant: 'green' as const },
    calculated: { label: 'Calculated Metric', variant: 'orange' as const },
    estimated: { label: 'AI Estimate', variant: 'amber' as const },
  };

  return (
    <Card glow={glow} className={`flex flex-col justify-between ${className}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-xs font-mono font-medium truncate" style={{ color: '#A6A69A' }}>
          {displayTitle}
        </span>
        <Badge variant={sourceBadges[displaySource].variant} size="sm">
          {sourceBadges[displaySource].label}
        </Badge>
      </div>

      <div className="flex items-baseline gap-1.5 my-1">
        <span className="font-heading text-2xl font-bold tracking-tight" style={{ color: '#F4F1E9' }}>
          {typeof displayValue === 'number' ? displayValue.toLocaleString() : displayValue}
        </span>
        {displayUnit && (
          <span className="text-xs font-mono font-medium" style={{ color: '#A6A69A' }}>
            {displayUnit}
          </span>
        )}
      </div>

      {displayChange !== undefined && (
        <div className="flex items-center gap-1.5 mt-2 pt-2 border-t" style={{ borderColor: '#34342B' }}>
          {displayDirection === 'up' && <TrendingUp size={14} style={{ color: '#54E38E' }} />}
          {displayDirection === 'down' && <TrendingDown size={14} style={{ color: '#FFB547' }} />}
          {displayDirection === 'stable' && <Minus size={14} style={{ color: '#A6A69A' }} />}
          <span
            className="text-xs font-mono font-medium"
            style={{
              color: displayDirection === 'up' ? '#54E38E' : displayDirection === 'down' ? '#FFB547' : '#A6A69A',
            }}
          >
            {displayChange > 0 ? `+${displayChange}%` : `${displayChange}%`} vs prior
          </span>
        </div>
      )}
    </Card>
  );
};
