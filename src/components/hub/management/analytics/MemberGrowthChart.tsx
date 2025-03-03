
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend, ReferenceLine, Area, ComposedChart 
} from 'recharts';
import { MemberGrowth } from '@/types/database/analytics';
import { TimePeriod } from '@/hooks/useHubAnalytics';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { useState, useMemo } from "react";

interface MemberGrowthChartProps {
  memberGrowth: MemberGrowth[];
  timePeriod: TimePeriod;
  onTimePeriodChange: (value: TimePeriod) => void;
  formatDate: (date: string, period: TimePeriod) => string;
}

// Define the colors for different time periods
const chartColors = {
  day: {
    stroke: "#8884d8",
    fill: "#8884d8",
    gradient: ["#8884d8", "#8884d850"]
  },
  week: {
    stroke: "#82ca9d",
    fill: "#82ca9d", 
    gradient: ["#82ca9d", "#82ca9d50"]
  },
  month: {
    stroke: "#ffc658",
    fill: "#ffc658",
    gradient: ["#ffc658", "#ffc65850"]
  },
  year: {
    stroke: "#ff8042",
    fill: "#ff8042",
    gradient: ["#ff8042", "#ff804250"]
  }
};

// Recommended data points for each time period
const recommendedDataPoints = {
  day: 30,
  week: 10, 
  month: 12,
  year: 5
};

export function MemberGrowthChart({ 
  memberGrowth, 
  timePeriod, 
  onTimePeriodChange, 
  formatDate 
}: MemberGrowthChartProps) {
  const [showCumulative, setShowCumulative] = useState(false);
  
  // Determine if we should display a message about insufficient data
  const hasEnoughData = memberGrowth.length > 0;
  
  // Calculate total and average growth for summary
  const totalNewMembers = useMemo(() => 
    memberGrowth.reduce((sum, item) => sum + item.new_members, 0),
    [memberGrowth]
  );
  
  const averageGrowth = useMemo(() => 
    memberGrowth.length > 0 ? (totalNewMembers / memberGrowth.length).toFixed(1) : '0',
    [memberGrowth, totalNewMembers]
  );
  
  // Prepare data with cumulative growth
  const chartData = useMemo(() => {
    let cumulativeCount = 0;
    return memberGrowth.map(item => ({
      ...item,
      date: item.month, // Keep original date field for reference
      cumulativeCount: (cumulativeCount += item.new_members)
    }));
  }, [memberGrowth]);
  
  // Determine the chart type based on the selected time period
  const renderChart = () => {
    const color = chartColors[timePeriod];
    
    if (timePeriod === 'day') {
      // Line chart for daily view
      return (
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart 
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 30 }}
          >
            <defs>
              <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color.gradient[0]} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={color.gradient[1]} stopOpacity={0.2}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date"
              tickFormatter={(value) => formatDate(value, timePeriod)}
              angle={-45}
              textAnchor="end"
              height={70}
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              yAxisId="left"
              tickFormatter={(value) => value % 1 === 0 ? value : ''}
              width={40}
              domain={['dataMin - 1', 'dataMax + 2']}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              tickFormatter={(value) => value % 1 === 0 ? value : ''}
              width={40}
              domain={['dataMin', 'auto']}
              hide={!showCumulative}
            />
            <Tooltip 
              labelFormatter={(value) => formatDate(value, timePeriod)}
              formatter={(value, name) => {
                if (name === 'new_members') return [`${value} new members`];
                if (name === 'cumulativeCount') return [`${value} total members`];
                return [value];
              }}
              contentStyle={{ backgroundColor: 'white', borderRadius: '4px', border: '1px solid #e5e7eb' }}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="new_members" 
              fill="url(#colorGrowth)" 
              stroke={color.stroke} 
              name="New Members"
              yAxisId="left"
              animationDuration={800}
            />
            {showCumulative && (
              <Line 
                type="monotone" 
                dataKey="cumulativeCount" 
                stroke="#ff7300" 
                name="Total Members"
                yAxisId="right"
                strokeWidth={2}
                dot={false}
                animationDuration={800}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      );
    }
    
    if (timePeriod === 'year') {
      // Composed chart for yearly view
      return (
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart 
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 30 }}
          >
            <defs>
              <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color.gradient[0]} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={color.gradient[1]} stopOpacity={0.2}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date"
              tickFormatter={(value) => formatDate(value, timePeriod)}
              angle={0}
              textAnchor="middle"
              height={50}
              tick={{ fontSize: 14 }}
            />
            <YAxis 
              yAxisId="left"
              tickFormatter={(value) => value % 1 === 0 ? value : ''}
              width={40}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              tickFormatter={(value) => value % 1 === 0 ? value : ''}
              width={40}
              hide={!showCumulative}
            />
            <Tooltip 
              labelFormatter={(value) => formatDate(value, timePeriod)}
              formatter={(value, name) => {
                if (name === 'new_members') return [`${value} new members`];
                if (name === 'cumulativeCount') return [`${value} total members`];
                return [value];
              }}
              contentStyle={{ backgroundColor: 'white', borderRadius: '4px', border: '1px solid #e5e7eb' }}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="new_members" 
              fill="url(#colorGrowth)" 
              stroke="none" 
              fillOpacity={0.3}
              name="Growth Trend"
              yAxisId="left"
            />
            <Bar 
              dataKey="new_members" 
              fill={color.fill} 
              name="New Members"
              yAxisId="left"
              radius={[4, 4, 0, 0]}
              animationDuration={800}
            />
            {showCumulative && (
              <Line 
                type="monotone" 
                dataKey="cumulativeCount" 
                stroke="#ff7300" 
                name="Total Members"
                yAxisId="right"
                strokeWidth={2}
                animationDuration={800}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      );
    }
    
    // Default bar chart for weekly and monthly views
    return (
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart 
          data={chartData}
          margin={{ top: 20, right: 30, left: 0, bottom: 30 }}
        >
          <defs>
            <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color.gradient[0]} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={color.gradient[1]} stopOpacity={0.2}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date"
            tickFormatter={(value) => formatDate(value, timePeriod)}
            angle={-45}
            textAnchor="end"
            height={70}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            yAxisId="left"
            tickFormatter={(value) => value % 1 === 0 ? value : ''}
            width={40}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            tickFormatter={(value) => value % 1 === 0 ? value : ''}
            width={40}
            hide={!showCumulative}
          />
          <Tooltip 
            labelFormatter={(value) => formatDate(value, timePeriod)}
            formatter={(value, name) => {
              if (name === 'new_members') return [`${value} new members`];
              if (name === 'cumulativeCount') return [`${value} total members`];
              return [value];
            }}
            contentStyle={{ backgroundColor: 'white', borderRadius: '4px', border: '1px solid #e5e7eb' }}
          />
          <Legend />
          <Bar 
            dataKey="new_members" 
            fill={timePeriod === 'week' ? 'url(#colorGrowth)' : color.fill} 
            name="New Members"
            radius={[4, 4, 0, 0]}
            yAxisId="left"
            animationDuration={800}
          />
          {showCumulative && (
            <Line 
              type="monotone" 
              dataKey="cumulativeCount" 
              stroke="#ff7300" 
              name="Total Members"
              yAxisId="right"
              strokeWidth={2}
              animationDuration={800}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    );
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <CardTitle>Member Growth</CardTitle>
            <TooltipProvider>
              <UITooltip>
                <TooltipTrigger>
                  <Info size={16} className="text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Shows new member signups over time</p>
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
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
            <ToggleGroup 
              type="single" 
              value={showCumulative ? "true" : "false"} 
              onValueChange={(value) => setShowCumulative(value === "true")}
              className="flex-wrap justify-center"
            >
              <ToggleGroupItem value="false" aria-label="Show only new members">
                New Only
              </ToggleGroupItem>
              <ToggleGroupItem value="true" aria-label="Show cumulative growth">
                Show Total
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
        
        {hasEnoughData && memberGrowth.length > 1 && (
          <div className="flex flex-wrap gap-4 mt-2">
            <div className="bg-muted/30 p-2 rounded-md">
              <span className="text-sm text-muted-foreground">Total New Members:</span>
              <span className="ml-2 font-semibold">{totalNewMembers}</span>
            </div>
            <div className="bg-muted/30 p-2 rounded-md">
              <span className="text-sm text-muted-foreground">Avg. per {timePeriod}:</span>
              <span className="ml-2 font-semibold">{averageGrowth}</span>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="h-[400px]">
        {hasEnoughData ? (
          renderChart()
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-muted-foreground text-center mb-4">
              {memberGrowth.length > 0 ? 
                `Showing ${memberGrowth.length} ${timePeriod}s. Select a different time range to see more data.` : 
                'No member growth data available for this time period.'
              }
            </p>
            <p className="text-sm text-muted-foreground text-center">
              {`For ${timePeriod === 'day' ? 'daily' : 
                timePeriod === 'week' ? 'weekly' : 
                timePeriod === 'month' ? 'monthly' : 'yearly'} view, 
                we recommend at least ${recommendedDataPoints[timePeriod]} data points.`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
