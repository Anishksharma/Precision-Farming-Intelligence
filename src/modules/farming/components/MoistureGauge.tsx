import React from 'react';
import { motion } from 'framer-motion';

export interface MoistureGaugeProps {
  value: number; // 0 - 100%
  targetOptimal?: number;
  minThreshold?: number;
  maxThreshold?: number;
  size?: number;
  label?: string;
  fieldId?: string;
}

export const MoistureGauge: React.FC<MoistureGaugeProps> = ({
  value,
  targetOptimal = 50,
  minThreshold = 35,
  maxThreshold = 70,
  size = 200,
  label = 'Volumetric Soil Moisture',
}) => {
  const clamped = Math.min(100, Math.max(0, value));
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Semi-circle gauge (220 degrees sweep)
  const angle = 220;
  const strokeDasharray = `${(angle / 360) * circumference} ${circumference}`;
  const strokeDashoffset = ((100 - clamped) / 100) * ((angle / 360) * circumference);

  const getColor = (val: number) => {
    if (val < 20) return '#FF1744'; // critical emergency red
    if (val < minThreshold) return '#FFB547'; // amber
    if (val <= maxThreshold) return '#B6F23A'; // lime
    return '#54E38E'; // green
  };

  const currentColor = getColor(clamped);

  return (
    <div className="flex flex-col items-center justify-center relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-110">
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#20201B"
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
        />

        {/* Animated Value Arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={currentColor}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: (angle / 360) * circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          strokeLinecap="round"
        />
      </svg>

      {/* Center readout */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
        <span className="font-mono text-3xl font-extrabold tracking-tight" style={{ color: currentColor }}>
          {clamped.toFixed(1)}%
        </span>
        <span className="text-[10px] font-mono uppercase tracking-wider mt-0.5" style={{ color: '#A6A69A' }}>
          {label}
        </span>
        <div className="flex items-center gap-1.5 mt-1 text-[10px] font-mono" style={{ color: '#6B6B60' }}>
          <span>Opt: {targetOptimal}%</span>
          <span>•</span>
          <span>Min: {minThreshold}%</span>
        </div>
      </div>
    </div>
  );
};
