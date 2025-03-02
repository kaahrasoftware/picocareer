
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Member Growth Over Time</CardTitle>
          <ToggleGroup 
            type="single" 
            value={timePeriod} 
            onValueChange={(value: TimePeriod) => onTimePeriodChange(value)}
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
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={memberGrowth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month" 
              tickFormatter={(value) => formatDate(value, timePeriod)}
            />
            <YAxis />
            <Tooltip 
              labelFormatter={(value) => formatDate(value, timePeriod)}
              formatter={(value) => [`${value} new members`]}
            />
            <Bar 
              dataKey="new_members" 
              fill="#8884d8" 
              name="New Members"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
