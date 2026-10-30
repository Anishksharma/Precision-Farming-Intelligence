import React from 'react';
import { motion } from 'framer-motion';

export interface LoadingSpinnerProps {
  size?: number;
  color?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 24,
  color = '#FF8A24',
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.svg
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="#34342B"
          strokeWidth="3"
        />
        <path
          d="M12 2C6.47715 2 2 6.47715 2 12C2 14.2388 2.73562 16.3075 3.97825 18"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </motion.svg>
    </div>
  );
};
