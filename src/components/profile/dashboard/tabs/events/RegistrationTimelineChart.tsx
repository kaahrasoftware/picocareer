
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RegistrationTimelineChartProps {
  data: { date: string; count: number }[];
  isLoading: boolean;
  timePeriod: string;
}

export function RegistrationTimelineChart({ 
  data, 
  isLoading,
  timePeriod
}: RegistrationTimelineChartProps) {
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No registration timeline data available
      </div>
    );
  }

  // Format the date label based on time period for better readability
  const formatXAxis = (dateStr: string) => {
    if (timePeriod === 'week' || timePeriod === 'month') {
      // For week or month, show day and month
      const date = new Date(dateStr);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    } else if (timePeriod === 'quarter' && dateStr.includes('W')) {
      // For quarter with week format
      const parts = dateStr.split('-W');
      return `W${parts[1]}`;
    } else {
      // For year and all, show month/year
      const parts = dateStr.split('-');
      return `${parts[1]}/${parts[0].slice(2)}`;
    }
  };

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatXAxis}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            allowDecimals={false}
            width={30}
          />
          <Tooltip 
            formatter={(value) => [`${value} registrations`, 'Count']}
            labelFormatter={(label) => {
              // Display a more readable date format in tooltip
              if (timePeriod === 'week' || timePeriod === 'month') {
                return new Date(label).toLocaleDateString();
              } else if (timePeriod === 'quarter' && label.includes('W')) {
                return `Week ${label.split('-W')[1]}, ${label.split('-')[0]}`;
              } else {
                const [year, month] = label.split('-');
                return `${new Date(0, parseInt(month) - 1).toLocaleString('default', { month: 'long' })} ${year}`;
              }
            }}
            contentStyle={{ borderRadius: '4px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}
          />
          <Line 
            type="monotone" 
            dataKey="count" 
            stroke="#8b5cf6" 
            strokeWidth={2}
            dot={{ stroke: '#8b5cf6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2, fill: '#fff' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
