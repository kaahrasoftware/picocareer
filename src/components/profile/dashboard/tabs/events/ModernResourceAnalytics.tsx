
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'];

export function ModernResourceAnalytics() {
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['event-resource-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_resource_interactions')
        .select(`
          id,
          interaction_type,
          created_at,
          metadata,
          resource_id,
          event_resources!inner(title, resource_type)
        `);

      if (error) throw error;

      // Process the data for charts
      const processed = data?.map(item => {
        const metadata = typeof item.metadata === 'object' && item.metadata !== null ? item.metadata as any : {};
        return {
          ...item,
          source: metadata.source || 'unknown',
          resource_type: metadata.resource_type || 'unknown',
          resource_title: metadata.resource_title || 'Unknown Resource'
        };
      }) || [];

      return processed;
    }
  });

  if (isLoading) {
    return <div>Loading analytics...</div>;
  }

  const viewsData = analyticsData?.filter(item => item.interaction_type === 'view') || [];
  const downloadsData = analyticsData?.filter(item => item.interaction_type === 'download') || [];

  // Resource type distribution
  const resourceTypeData = analyticsData?.reduce((acc: any[], item) => {
    const type = item.resource_type || 'unknown';
    const existing = acc.find(d => d.name === type);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: type, value: 1 });
    }
    return acc;
  }, []) || [];

  // Daily engagement data
  const dailyData = analyticsData?.reduce((acc: any[], item) => {
    const date = new Date(item.created_at).toLocaleDateString();
    const existing = acc.find(d => d.date === date);
    if (existing) {
      if (item.interaction_type === 'view') {
        existing.views += 1;
      } else if (item.interaction_type === 'download') {
        existing.downloads += 1;
      }
    } else {
      acc.push({
        date,
        views: item.interaction_type === 'view' ? 1 : 0,
        downloads: item.interaction_type === 'download' ? 1 : 0
      });
    }
    return acc;
  }, []) || [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Resource Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Daily Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="views" stroke="#8884d8" />
                <Line type="monotone" dataKey="downloads" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resource Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={resourceTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {resourceTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Interaction Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{viewsData.length}</div>
              <div className="text-sm text-muted-foreground">Total Views</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{downloadsData.length}</div>
              <div className="text-sm text-muted-foreground">Total Downloads</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{resourceTypeData.length}</div>
              <div className="text-sm text-muted-foreground">Resource Types</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
