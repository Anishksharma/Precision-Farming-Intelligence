import React from 'react';
import { Card } from '../ui/Card';
import { Download } from 'lucide-react';

export interface ChartWrapperProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  onExport?: () => void;
  className?: string;
}

export const ChartWrapper: React.FC<ChartWrapperProps> = ({
  title,
  subtitle,
  children,
  action,
  onExport,
  className = '',
}) => {
  return (
    <Card className={`flex flex-col ${className}`}>
      <div className="flex items-start justify-between pb-3 border-b mb-4" style={{ borderColor: '#34342B' }}>
        <div>
          <h3 className="font-heading font-semibold text-sm tracking-wide" style={{ color: '#F4F1E9' }}>
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs font-mono mt-0.5" style={{ color: '#A6A69A' }}>
              {subtitle}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {action}
          {onExport && (
            <button
              onClick={onExport}
              title="Export Chart Data"
              className="p-1.5 rounded-lg border transition-colors cursor-pointer"
              style={{
                backgroundColor: '#20201B',
                borderColor: '#34342B',
                color: '#A6A69A',
              }}
            >
              <Download size={14} />
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 w-full min-h-[220px]">
        {children}
      </div>
    </Card>
  );
};
