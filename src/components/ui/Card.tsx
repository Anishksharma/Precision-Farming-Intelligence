import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

export interface CardProps extends HTMLMotionProps<'div'> {
  glow?: 'none' | 'orange' | 'lime' | 'red';
  bordered?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  glow = 'none',
  bordered = true,
  padding = 'md',
  children,
  className = '',
  ...props
}) => {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4 sm:p-5',
    lg: 'p-6 sm:p-7',
  };

  const glowShadows = {
    none: undefined,
    orange: '0 0 24px rgba(255, 138, 36, 0.12)',
    lime: '0 0 24px rgba(182, 242, 58, 0.12)',
    red: '0 0 24px rgba(255, 69, 69, 0.16)',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`
        rounded-xl backdrop-blur-sm relative overflow-hidden
        ${paddingClasses[padding]} ${className}
      `}
      style={{
        backgroundColor: '#171714',
        border: bordered ? '1px solid #34342B' : 'none',
        boxShadow: glowShadows[glow],
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};
