
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

export function LineChart({ className, children }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart className={className}>
        {children}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}

export function BarChart({ className, children }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart className={className}>
        {children}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}

export function PieChart({ className, children }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsPieChart className={className}>
        {children}
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}
