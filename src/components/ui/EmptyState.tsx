import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div
      className="flex flex-col items-center justify-center p-10 text-center rounded-xl border border-dashed"
      style={{
        backgroundColor: '#10100E',
        borderColor: '#34342B',
      }}
    >
      {icon && (
        <div className="mb-3 p-3 rounded-xl" style={{ backgroundColor: '#171714', color: '#FF8A24' }}>
          {icon}
        </div>
      )}
      <h4 className="font-heading font-semibold text-base mb-1" style={{ color: '#F4F1E9' }}>
        {title}
      </h4>
      <p className="text-xs max-w-sm mb-4" style={{ color: '#A6A69A' }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
