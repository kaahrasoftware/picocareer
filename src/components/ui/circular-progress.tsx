
import React from 'react';
import { cn } from '@/lib/utils';

interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  showValue?: boolean;
  className?: string;
  textClassName?: string;
}

export function CircularProgress({
  value,
  size = 100,
  strokeWidth = 10,
  showValue = true,
  className,
  textClassName
}: CircularProgressProps) {
  // Ensure value is between 0 and 100
  const normalizedValue = Math.min(100, Math.max(0, value));
  
  // Calculate circle properties
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedValue / 100) * circumference;

  return (
    <div className={cn('inline-flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeOpacity={0.2}
        />
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
        />
      </svg>
      {showValue && (
        <span 
          className={cn('absolute text-lg font-medium', textClassName)}
          style={{
            fontSize: size * 0.2 + 'px'
          }}
        >
          {Math.round(normalizedValue)}%
        </span>
      )}
    </div>
  );
}
