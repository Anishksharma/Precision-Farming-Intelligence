import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-xs font-mono font-medium" style={{ color: '#A6A69A' }}>
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <span className="absolute left-3 pointer-events-none" style={{ color: '#A6A69A' }}>
              {icon}
            </span>
          )}
          <input
            ref={ref}
            className={`
              w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors
              ${icon ? 'pl-9' : ''}
              focus:ring-1 focus:ring-[#FF8A24] focus:border-[#FF8A24]
              disabled:opacity-50 disabled:cursor-not-allowed
              ${className}
            `}
            style={{
              backgroundColor: '#10100E',
              borderColor: error ? '#FF4545' : '#34342B',
              color: '#F4F1E9',
            }}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs font-mono" style={{ color: '#FF4545' }}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
