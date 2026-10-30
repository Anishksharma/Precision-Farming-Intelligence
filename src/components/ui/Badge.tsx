import React from 'react';

export interface BadgeProps {
  variant?: 'orange' | 'lime' | 'green' | 'amber' | 'red' | 'neutral';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'orange',
  size = 'md',
  children,
  className = '',
}) => {
  const styles = {
    orange: { bg: 'rgba(255, 138, 36, 0.12)', border: 'rgba(255, 138, 36, 0.35)', text: '#FF8A24' },
    lime: { bg: 'rgba(182, 242, 58, 0.12)', border: 'rgba(182, 242, 58, 0.35)', text: '#B6F23A' },
    green: { bg: 'rgba(84, 227, 142, 0.12)', border: 'rgba(84, 227, 142, 0.35)', text: '#54E38E' },
    amber: { bg: 'rgba(255, 181, 71, 0.12)', border: 'rgba(255, 181, 71, 0.35)', text: '#FFB547' },
    red: { bg: 'rgba(255, 69, 69, 0.15)', border: 'rgba(255, 69, 69, 0.4)', text: '#FF4545' },
    neutral: { bg: 'rgba(166, 166, 154, 0.12)', border: 'rgba(52, 52, 43, 0.8)', text: '#A6A69A' },
  };

  const style = styles[variant];
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono font-medium rounded-md border ${sizeClasses} ${className}`}
      style={{
        backgroundColor: style.bg,
        borderColor: style.border,
        color: style.text,
      }}
    >
      {children}
    </span>
  );
};
