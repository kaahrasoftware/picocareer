
import React from 'react';
import { Card } from "@/components/ui/card";
import { CircularProgress } from "@/components/ui/circular-progress";
import { cn } from "@/lib/utils";

type ColorVariant = "blue" | "green" | "purple" | "amber" | "rose" | "cyan" | "indigo";

interface ColorfulStatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  variant?: ColorVariant;
  footer?: string;
  showProgress?: boolean;
  progressValue?: number;
  className?: string;
}

const gradients: Record<ColorVariant, string> = {
  blue: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/50 dark:to-blue-800/30",
  green: "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/50 dark:to-green-800/30",
  purple: "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/50 dark:to-purple-800/30",
  amber: "bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/50 dark:to-amber-800/30",
  rose: "bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/50 dark:to-rose-800/30",
  cyan: "bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/50 dark:to-cyan-800/30",
  indigo: "bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/50 dark:to-indigo-800/30",
};

const textColors: Record<ColorVariant, string> = {
  blue: "text-blue-600 dark:text-blue-400",
  green: "text-green-600 dark:text-green-400",
  purple: "text-purple-600 dark:text-purple-400",
  amber: "text-amber-600 dark:text-amber-400",
  rose: "text-rose-600 dark:text-rose-400",
  cyan: "text-cyan-600 dark:text-cyan-400",
  indigo: "text-indigo-600 dark:text-indigo-400",
};

const ringColors: Record<ColorVariant, string> = {
  blue: "ring-blue-200 dark:ring-blue-800/50",
  green: "ring-green-200 dark:ring-green-800/50",
  purple: "ring-purple-200 dark:ring-purple-800/50",
  amber: "ring-amber-200 dark:ring-amber-800/50",
  rose: "ring-rose-200 dark:ring-rose-800/50",
  cyan: "ring-cyan-200 dark:ring-cyan-800/50",
  indigo: "ring-indigo-200 dark:ring-indigo-800/50",
};

export function ColorfulStatCard({ 
  title, 
  value, 
  icon, 
  variant = "blue", 
  footer, 
  showProgress = false,
  progressValue = 0,
  className 
}: ColorfulStatCardProps) {
  return (
    <Card 
      className={cn(
        "overflow-hidden border-none shadow-sm h-full", 
        gradients[variant],
        className
      )}
    >
      <div className="p-5 flex flex-col h-full">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          {icon && (
            <div className={cn("p-2 rounded-full bg-white/80 dark:bg-gray-800/80", textColors[variant])}>
              {icon}
            </div>
          )}
        </div>
        
        <div className="flex-1 flex items-center gap-3">
          {showProgress ? (
            <CircularProgress 
              value={progressValue} 
              className={textColors[variant]} 
              size={60}
            />
          ) : null}
          
          <div className={cn("text-2xl font-bold flex-1", textColors[variant])}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
        </div>
        
        {footer && (
          <div className="mt-2 text-xs text-muted-foreground">
            {footer}
          </div>
        )}
      </div>
    </Card>
  );
}
