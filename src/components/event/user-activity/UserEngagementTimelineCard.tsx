
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Activity, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface HourlyEngagement {
  hour: number;
  interactions: number;
  unique_users: number;
}

interface UserEngagementTimelineCardProps {
  hourlyData: HourlyEngagement[];
  peakHour: string;
  averageSessionTime: number;
  className?: string;
}

export function UserEngagementTimelineCard({ 
  hourlyData, 
  peakHour, 
  averageSessionTime,
  className 
}: UserEngagementTimelineCardProps) {
  const formatSessionTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          User Engagement Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-700">{peakHour}</div>
              <div className="text-xs text-blue-600">Peak Activity</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-lg font-bold text-purple-700">
                {formatSessionTime(averageSessionTime)}
              </div>
              <div className="text-xs text-purple-600">Avg. Session</div>
            </div>
          </div>

          {/* Hourly Chart */}
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <XAxis 
                  dataKey="hour" 
                  tick={{ fontSize: 10 }}
                  tickFormatter={(hour) => `${hour.toString().padStart(2, '0')}:00`}
                />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip 
                  labelFormatter={(hour) => `${hour.toString().padStart(2, '0')}:00`}
                  formatter={(value: any, name: string) => [
                    value,
                    name === 'interactions' ? 'Interactions' : 'Unique Users'
                  ]}
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar 
                  dataKey="interactions" 
                  fill="#3b82f6" 
                  radius={[2, 2, 0, 0]}
                  name="interactions"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Activity Insights */}
          <div className="grid grid-cols-3 gap-2">
            <Badge variant="outline" className="justify-center p-2 text-xs">
              <Clock className="h-3 w-3 mr-1" />
              24h Activity
            </Badge>
            <Badge variant="outline" className="justify-center p-2 text-xs">
              <BarChart3 className="h-3 w-3 mr-1" />
              Live Tracking
            </Badge>
            <Badge variant="outline" className="justify-center p-2 text-xs">
              <Activity className="h-3 w-3 mr-1" />
              Real-time
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
