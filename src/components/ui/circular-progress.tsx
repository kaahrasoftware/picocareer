import React from "react";
import { cn } from "@/lib/utils";

interface CircularProgressProps {
  percentage: number;
  size?: "sm" | "md" | "lg";
  color?: string;
  label?: string;
  className?: string;
}

export function CircularProgress({
  percentage,
  size = "md",
  color = "#8B5CF6",
  label,
  className,
}: CircularProgressProps) {
  const sizes = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  const strokeWidth = size === "sm" ? 4 : 6;
  const radius = size === "sm" ? 28 : size === "md" ? 42 : 56;
  const circumference = 2 * Math.PI * radius;
  const progress = ((100 - percentage) / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", sizes[size], className)}>
      <svg className="w-full h-full transform -rotate-90">
        <circle
          className="text-gray-700"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="50%"
          cy="50%"
        />
        <circle
          className="transition-all duration-300 ease-in-out"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          strokeLinecap="round"
          stroke={color}
          fill="transparent"
          r={radius}
          cx="50%"
          cy="50%"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-xl font-bold">{percentage}%</span>
        {label && <span className="text-xs mt-1 text-gray-400">{label}</span>}
      </div>
    </div>
  );
}