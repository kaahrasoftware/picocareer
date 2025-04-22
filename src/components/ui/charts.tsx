
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

// Enhanced helper to check if data contains NaN values or is otherwise invalid
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
          if (!point || typeof point !== 'object') {
            console.warn('Invalid data point:', point);
            return false;
          }
          
          // If the point has the dataKey property, ensure it's a valid number
          if (dataKey in point) {
            const value = point[dataKey];
            if (value === undefined || value === null || Number.isNaN(Number(value))) {
              console.warn(`Invalid data detected: ${dataKey} contains NaN or undefined`, point);
              return false;
            }
          }
        }
      }
      
      // For Pie charts, check nameKey and value props
      if (child.type && child.type.displayName === 'Pie') {
        const nameKey = child.props.nameKey;
        const valueKey = child.props.dataKey;
        
        if (nameKey && valueKey) {
          for (const point of data) {
            if (!point || typeof point !== 'object') {
              console.warn('Invalid pie data point:', point);
              return false;
            }
            
            const value = point[valueKey];
            if (value === undefined || value === null || Number.isNaN(Number(value))) {
              console.warn(`Invalid pie data detected: ${valueKey} contains NaN or undefined`, point);
              return false;
            }
          }
        }
      }
      
      // For specific chart types, check domain values
      if (child.type && (child.type.displayName === 'XAxis' || child.type.displayName === 'YAxis')) {
        const domain = child.props.domain;
        if (Array.isArray(domain)) {
          for (const value of domain) {
            if (value === undefined || value === null || Number.isNaN(Number(value))) {
              console.warn(`Invalid domain value detected: ${value}`);
              return false;
            }
          }
        }
      }
    }
  }
  
  return true; // Default to allowing render - the charts have their own error handling
};

export function LineChart({ className, children }: ChartProps) {
  if (!hasValidData(children)) {
    return <div className="flex h-full items-center justify-center text-muted-foreground">Invalid chart data detected</div>;
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
    return <div className="flex h-full items-center justify-center text-muted-foreground">Invalid chart data detected</div>;
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
    return <div className="flex h-full items-center justify-center text-muted-foreground">Invalid chart data detected</div>;
  }
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsPieChart className={className}>
        {children}
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}
