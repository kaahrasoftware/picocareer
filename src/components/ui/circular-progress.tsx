
import * as React from "react";
import { cn } from "@/lib/utils";

interface CircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  size?: number;
  strokeWidth?: number;
  showValue?: boolean;
  valueSize?: number;
  valueClassName?: string;
}

export function CircularProgress({
  value,
  size = 100,
  strokeWidth = 10,
  showValue = true,
  valueSize,
  valueClassName,
  className,
  ...props
}: CircularProgressProps) {
  // Calculate properties for SVG
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;
  const effectiveValueSize = valueSize || size / 4;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} {...props}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="stroke-muted"
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="stroke-current transition-all duration-300 ease-in-out"
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>

      {/* Value text */}
      {showValue && (
        <div 
          className={cn("absolute text-center font-medium", valueClassName)} 
          style={{ fontSize: effectiveValueSize }}
        >
          {Math.round(value)}%
        </div>
      )}
    </div>
  );
}
