
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { MemberGrowth } from '@/types/database/analytics';
import { TimePeriod } from '@/hooks/useHubAnalytics';

interface MemberGrowthChartProps {
  memberGrowth: MemberGrowth[];
  timePeriod: TimePeriod;
  onTimePeriodChange: (value: TimePeriod) => void;
  formatDate: (date: string, period: TimePeriod) => string;
}

export function MemberGrowthChart({ 
  memberGrowth, 
  timePeriod, 
  onTimePeriodChange, 
  formatDate 
}: MemberGrowthChartProps) {
  // Determine if we should display a message about insufficient data
  const hasEnoughData = memberGrowth.length > 0;
  
  // Determine min required data points based on time period
  const requiredDataPoints = {
    day: 30,
    week: 10, 
    month: 12,
    year: 5
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle>Member Growth Over Time</CardTitle>
          <ToggleGroup 
            type="single" 
            value={timePeriod} 
            onValueChange={(value: TimePeriod) => onTimePeriodChange(value)}
            className="flex-wrap justify-center"
          >
            <ToggleGroupItem value="day" aria-label="View daily data">
              Daily
            </ToggleGroupItem>
            <ToggleGroupItem value="week" aria-label="View weekly data">
              Weekly
            </ToggleGroupItem>
            <ToggleGroupItem value="month" aria-label="View monthly data">
              Monthly
            </ToggleGroupItem>
            <ToggleGroupItem value="year" aria-label="View yearly data">
              Yearly
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </CardHeader>
      <CardContent className="h-[400px]">
        {hasEnoughData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={memberGrowth}
              margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="month" 
                tickFormatter={(value) => formatDate(value, timePeriod)}
                angle={-45}
                textAnchor="end"
                height={70}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tickFormatter={(value) => value % 1 === 0 ? value : ''}
                width={40}
              />
              <Tooltip 
                labelFormatter={(value) => formatDate(value, timePeriod)}
                formatter={(value) => [`${value} new members`]}
                contentStyle={{ backgroundColor: 'white', borderRadius: '4px' }}
              />
              <Legend />
              <Bar 
                dataKey="new_members" 
                fill="#8884d8" 
                name="New Members"
                radius={[4, 4, 0, 0]}
                animationDuration={800}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-muted-foreground text-center mb-4">
              {memberGrowth.length > 0 ? 
                `Showing ${memberGrowth.length} periods. Select a different time range to see more data.` : 
                'No member growth data available for this time period.'
              }
            </p>
            <p className="text-sm text-muted-foreground text-center">
              {`For ${timePeriod === 'day' ? 'daily' : 
                timePeriod === 'week' ? 'weekly' : 
                timePeriod === 'month' ? 'monthly' : 'yearly'} view, 
                we recommend at least ${requiredDataPoints[timePeriod]} data points.`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
