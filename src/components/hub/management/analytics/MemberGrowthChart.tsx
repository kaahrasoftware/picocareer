
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export type TimePeriod = 'last_7_days' | 'last_30_days' | 'last_90_days' | 'last_year';

export interface MemberGrowth {
  month: string;
  new_members: number;
}

interface MemberGrowthChartProps {
  data: MemberGrowth[];
  timePeriod: TimePeriod;
  onTimePeriodChange: (period: TimePeriod) => void;
  formatDate: (dateStr: string, period: TimePeriod) => string;
}

export function MemberGrowthChart({ 
  data, 
  timePeriod, 
  onTimePeriodChange, 
  formatDate 
}: MemberGrowthChartProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Member Growth</CardTitle>
        <Select value={timePeriod} onValueChange={onTimePeriodChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last_7_days">Last 7 Days</SelectItem>
            <SelectItem value="last_30_days">Last 30 Days</SelectItem>
            <SelectItem value="last_90_days">Last 90 Days</SelectItem>
            <SelectItem value="last_year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tickFormatter={(value) => formatDate(value, timePeriod)}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => formatDate(String(value), timePeriod)}
                formatter={(value: number) => [value, 'New Members']}
              />
              <Line 
                type="monotone" 
                dataKey="new_members" 
                stroke="#8884d8" 
                strokeWidth={2}
                dot={{ fill: '#8884d8' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
