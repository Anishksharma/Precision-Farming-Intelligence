import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: '#FF8A24',
          color: '#0B0B0A',
          borderColor: '#FF8A24',
          fontWeight: 600,
        };
      case 'secondary':
        return {
          backgroundColor: '#20201B',
          color: '#F4F1E9',
          borderColor: '#34342B',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: '#FF8A24',
          borderColor: '#FF8A24',
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: '#A6A69A',
          borderColor: 'transparent',
        };
      case 'danger':
        return {
          backgroundColor: '#FF4545',
          color: '#F4F1E9',
          borderColor: '#FF4545',
        };
    }
  };

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      className={`
        inline-flex items-center justify-center gap-2 rounded-lg border font-medium
        transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeClasses[size]} ${className}
      `}
      style={getVariantStyles()}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </motion.button>
  );
};
