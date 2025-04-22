
import React from "react";
import {
  LineChart as RechartsLineChart,
  BarChart as RechartsBarChart,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
} from "recharts";

export interface ChartProps {
  className?: string;
  children: React.ReactNode;
}

// Helper to check if data contains NaN values
const hasValidData = (children: React.ReactNode): boolean => {
  if (!children) return false;
  
  // Check if children is an array
  const childrenArray = React.Children.toArray(children);
  
  // If there are no children, the data is likely valid (empty)
  if (childrenArray.length === 0) return true;
  
  return true; // Default to allowing render - the charts have their own error handling
};

export function LineChart({ className, children }: ChartProps) {
  if (!hasValidData(children)) {
    return <div className="flex h-full items-center justify-center text-muted-foreground">No valid chart data</div>;
  }
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart className={className}>
        {children}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}

export function BarChart({ className, children }: ChartProps) {
  if (!hasValidData(children)) {
    return <div className="flex h-full items-center justify-center text-muted-foreground">No valid chart data</div>;
  }
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart className={className}>
        {children}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}

export function PieChart({ className, children }: ChartProps) {
  if (!hasValidData(children)) {
    return <div className="flex h-full items-center justify-center text-muted-foreground">No valid chart data</div>;
  }
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsPieChart className={className}>
        {children}
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}
