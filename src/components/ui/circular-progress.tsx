
import React from 'react';
import { cn } from '@/lib/utils';

interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  showValue?: boolean;
  className?: string;
  textClassName?: string;
  valuePrefix?: string;
  valueSuffix?: string;
}

export function CircularProgress({
  value,
  size = 100,
  strokeWidth = 10,
  showValue = true,
  className,
  textClassName,
  valuePrefix = '',
  valueSuffix = '%'
}: CircularProgressProps) {
  // Ensure value is between 0 and 100
  const normalizedValue = Math.min(100, Math.max(0, value));
  
  // Calculate circle properties
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedValue / 100) * circumference;

  return (
    <div className={cn('inline-flex items-center justify-center relative', className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeOpacity={0.2}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-in-out"
        />
      </svg>
      {showValue && (
        <span 
          className={cn('absolute text-lg font-medium', textClassName)}
          style={{
            fontSize: size * 0.2 + 'px'
          }}
        >
          {valuePrefix}{Math.round(normalizedValue)}{valueSuffix}
        </span>
      )}
    </div>
  );
}
