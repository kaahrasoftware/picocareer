
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
  
  // Check for specific recharts components that might have NaN data
  for (const child of childrenArray) {
    if (React.isValidElement(child) && child.props && child.props.data) {
      // Check if any data point contains NaN, undefined or null values
      const data = child.props.data;
      if (!data || !Array.isArray(data) || data.length === 0) {
        // Empty data is allowed, but not ideal
        continue;
      }
      
      // Check if dataKey exists and is valid
      const dataKey = child.props.dataKey;
      if (dataKey && typeof dataKey === 'string') {
        // Check if any data point has NaN for the specified dataKey
        for (const point of data) {
          const value = point[dataKey];
          if (value === undefined || value === null || Number.isNaN(Number(value))) {
            console.warn(`Invalid data detected: ${dataKey} contains NaN or undefined`, point);
            return false;
          }
        }
      }
    }
  }
  
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
