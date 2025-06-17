
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { UserActivityCard, TopUsersCard, UserEngagementTimelineCard, DevicePlatformCard } from '@/components/event/user-activity';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'];

interface UserActivity {
  id: string;
  profile_id: string;
  resource_id: string;
  interaction_type: 'view' | 'download';
  created_at: string;
  metadata?: {
    source?: string;
    resource_type?: string;
    resource_title?: string;
    device_type?: string;
    browser?: string;
  };
  profiles?: {
    full_name: string;
    avatar_url?: string;
  };
}

interface TopUser {
  profile_id: string;
  full_name: string;
  avatar_url?: string;
  total_views: number;
  total_downloads: number;
  total_interactions: number;
  unique_resources: number;
}

interface HourlyEngagement {
  hour: number;
  interactions: number;
  unique_users: number;
}

interface DeviceData {
  device_type: string;
  count: number;
  percentage: number;
}

interface BrowserData {
  browser: string;
  count: number;
  percentage: number;
}

// Safe metadata extraction helper
const getMetadataValue = (metadata: any, key: string, defaultValue: string = 'unknown'): string => {
  if (!metadata || typeof metadata !== 'object') return defaultValue;
  const value = metadata[key];
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null) {
    // If it's an object, try to extract meaningful string representation
    if (value.name) return String(value.name);
    if (value.type) return String(value.type);
    return defaultValue;
  }
  return value ? String(value) : defaultValue;
};

export function ModernResourceAnalytics() {
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['event-resource-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_resource_interactions')
        .select(`
          id,
          profile_id,
          resource_id,
          interaction_type,
          created_at,
          metadata,
          profiles!inner(
            full_name,
            avatar_url
          ),
          event_resources!inner(
            title,
            resource_type
          )
        `);

      if (error) throw error;

      // Process the data with safe metadata extraction
      const processed = data?.map(item => {
        const metadata = item.metadata || {};
        return {
          ...item,
          source: getMetadataValue(metadata, 'source'),
          resource_type: item.event_resources?.resource_type || getMetadataValue(metadata, 'resource_type'),
          resource_title: item.event_resources?.title || getMetadataValue(metadata, 'resource_title', 'Unknown Resource'),
          device_type: getMetadataValue(metadata, 'device_type', 'desktop'),
          browser: getMetadataValue(metadata, 'browser')
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

  // Process top users data
  const topUsersMap = new Map<string, TopUser>();
  analyticsData?.forEach(item => {
    if (!item.profile_id || !item.profiles) return;
    
    const existing = topUsersMap.get(item.profile_id) || {
      profile_id: item.profile_id,
      full_name: item.profiles.full_name,
      avatar_url: item.profiles.avatar_url,
      total_views: 0,
      total_downloads: 0,
      total_interactions: 0,
      unique_resources: 0
    };
    
    if (item.interaction_type === 'view') {
      existing.total_views += 1;
    } else if (item.interaction_type === 'download') {
      existing.total_downloads += 1;
    }
    existing.total_interactions += 1;
    
    topUsersMap.set(item.profile_id, existing);
  });

  // Calculate unique resources per user
  topUsersMap.forEach((user, profileId) => {
    const uniqueResources = new Set(
      analyticsData?.filter(item => item.profile_id === profileId)
        .map(item => item.resource_id) || []
    );
    user.unique_resources = uniqueResources.size;
  });

  const topUsers = Array.from(topUsersMap.values())
    .sort((a, b) => b.total_interactions - a.total_interactions)
    .slice(0, 10);

  // Process hourly engagement
  const hourlyMap = new Map<number, { interactions: number; users: Set<string> }>();
  analyticsData?.forEach(item => {
    const hour = new Date(item.created_at).getHours();
    const existing = hourlyMap.get(hour) || { interactions: 0, users: new Set() };
    existing.interactions += 1;
    if (item.profile_id) {
      existing.users.add(item.profile_id);
    }
    hourlyMap.set(hour, existing);
  });

  const hourlyData: HourlyEngagement[] = Array.from({ length: 24 }, (_, hour) => {
    const data = hourlyMap.get(hour) || { interactions: 0, users: new Set() };
    return {
      hour,
      interactions: data.interactions,
      unique_users: data.users.size
    };
  });

  // Calculate peak hour
  const peakHourData = hourlyData.reduce((max, current) => 
    current.interactions > max.interactions ? current : max
  );
  const peakHour = `${peakHourData.hour.toString().padStart(2, '0')}:00`;

  // Calculate average session time (mock data for now)
  const averageSessionTime = 240; // 4 minutes

  // Process device and browser data with safe string extraction
  const deviceMap = new Map<string, number>();
  const browserMap = new Map<string, number>();

  analyticsData?.forEach(item => {
    const deviceType = item.device_type || 'desktop';
    const browser = item.browser || 'unknown';
    
    deviceMap.set(deviceType, (deviceMap.get(deviceType) || 0) + 1);
    browserMap.set(browser, (browserMap.get(browser) || 0) + 1);
  });

  const totalInteractions = analyticsData?.length || 0;
  
  const deviceData: DeviceData[] = Array.from(deviceMap.entries()).map(([type, count]) => ({
    device_type: type,
    count,
    percentage: totalInteractions > 0 ? (count / totalInteractions) * 100 : 0
  }));

  const browserData: BrowserData[] = Array.from(browserMap.entries()).map(([browser, count]) => ({
    browser,
    count,
    percentage: totalInteractions > 0 ? (count / totalInteractions) * 100 : 0
  }));

  // Convert analytics data to UserActivity format with safe metadata
  const userActivities: UserActivity[] = analyticsData?.map(item => ({
    id: item.id,
    profile_id: item.profile_id,
    resource_id: item.resource_id,
    interaction_type: item.interaction_type as 'view' | 'download',
    created_at: item.created_at,
    metadata: {
      source: item.source,
      resource_type: item.resource_type,
      resource_title: item.resource_title,
      device_type: item.device_type,
      browser: item.browser
    },
    profiles: item.profiles
  })) || [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Resource Analytics</h2>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Interactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{analyticsData?.length || 0}</div>
            <div className="text-sm text-muted-foreground">All user interactions</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{viewsData.length}</div>
            <div className="text-sm text-muted-foreground">Resource views</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Total Downloads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{downloadsData.length}</div>
            <div className="text-sm text-muted-foreground">Resource downloads</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Engagement Chart */}
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
                <Line type="monotone" dataKey="views" stroke="#8884d8" name="Views" />
                <Line type="monotone" dataKey="downloads" stroke="#82ca9d" name="Downloads" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Resource Type Distribution */}
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

        {/* User Engagement Timeline */}
        <UserEngagementTimelineCard
          hourlyData={hourlyData}
          peakHour={peakHour}
          averageSessionTime={averageSessionTime}
        />

        {/* Device Platform Usage */}
        <DevicePlatformCard
          deviceData={deviceData}
          browserData={browserData}
        />

        {/* Top Users */}
        <TopUsersCard
          users={topUsers}
          title="Most Active Users"
        />

        {/* Recent User Activity */}
        <UserActivityCard
          activities={userActivities.slice(0, 10)}
          title="Recent Resource Interactions"
        />
      </div>
    </div>
  );
}
