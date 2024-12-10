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
  // Dynamic sizing based on percentage value
  const getSize = () => {
    if (percentage >= 95) return "w-36 h-36";
    if (percentage >= 85) return "w-32 h-32";
    return "w-28 h-28";
  };

  const baseSize = size === "sm" ? "w-24 h-24" : size === "md" ? "w-28 h-28" : getSize();
  const strokeWidth = size === "sm" ? 3 : 4;
  const radius = size === "sm" ? 42 : size === "md" ? 48 : 60;
  const circumference = 2 * Math.PI * radius;
  const progress = ((100 - percentage) / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center group", baseSize, className)}>
      {/* Background circle */}
      <div className="absolute inset-0 rounded-full bg-gray-800/50" />
      
      {/* Progress circle */}
      <svg className="w-full h-full transform -rotate-90">
        <circle
          className="opacity-20"
          strokeWidth={strokeWidth}
          stroke={color}
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

      {/* Percentage display */}
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white">{percentage}%</span>
        {label && (
          <span className="text-xs mt-1 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}