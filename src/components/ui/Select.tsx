import React, { forwardRef } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-xs font-mono font-medium" style={{ color: '#A6A69A' }}>
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`
            w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors
            focus:ring-1 focus:ring-[#FF8A24] focus:border-[#FF8A24]
            disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
            ${className}
          `}
          style={{
            backgroundColor: '#10100E',
            borderColor: error ? '#FF4545' : '#34342B',
            color: '#F4F1E9',
          }}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} style={{ backgroundColor: '#171714', color: '#F4F1E9' }}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-xs font-mono" style={{ color: '#FF4545' }}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
