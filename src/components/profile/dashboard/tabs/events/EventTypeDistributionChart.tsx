
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface EventTypeDistributionProps {
  data: { type: string; count: number }[];
  isLoading: boolean;
}

// Array of colors for the pie chart segments
const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f97316', '#f59e0b', '#84cc16', '#14b8a6', '#06b6d4'];

export function EventTypeDistributionChart({ data, isLoading }: EventTypeDistributionProps) {
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
        No event data available
      </div>
    );
  }

  // Process data for the pie chart
  const chartData = data.map(item => ({
    name: item.type,
    value: item.count
  }));

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [`${value} events`, 'Count']}
            contentStyle={{ borderRadius: '4px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}
          />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
