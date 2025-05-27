
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { Eye, Download, TrendingUp, Clock, Users, Activity, RefreshCw } from 'lucide-react';
import { ColorfulStatCard } from '@/components/ui/colorful-stat-card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfDay } from 'date-fns';

const MODERN_COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f97316', '#f59e0b', '#ef4444', '#06b6d4'];

interface ResourceAnalytics {
  topViewed: Array<{ title: string; view_count: number; resource_type: string }>;
  topDownloaded: Array<{ title: string; download_count: number; resource_type: string }>;
  engagementByType: Array<{ type: string; views: number; downloads: number; engagement_rate: number }>;
  dailyActivity: Array<{ date: string; views: number; downloads: number }>;
  conversionRates: Array<{ type: string; conversion_rate: number }>;
  totalStats: {
    totalViews: number;
    totalDownloads: number;
    totalEngagement: number;
    averageEngagementRate: number;
  };
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.dataKey}: <span className="font-semibold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function EventResourceAnalytics() {
  const { data: analytics, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['event-resource-analytics'],
    queryFn: async (): Promise<ResourceAnalytics> => {
      console.log('Fetching resource analytics...');
      
      try {
        // Get all resources with engagement data
        const { data: resources, error: resourcesError } = await supabase
          .from('event_resources')
          .select(`
            id,
            title,
            resource_type,
            view_count,
            download_count,
            last_viewed_at,
            last_downloaded_at,
            events!inner(title)
          `)
          .order('view_count', { ascending: false });

        if (resourcesError) throw resourcesError;

        if (!resources || resources.length === 0) {
          return {
            topViewed: [],
            topDownloaded: [],
            engagementByType: [],
            dailyActivity: [],
            conversionRates: [],
            totalStats: {
              totalViews: 0,
              totalDownloads: 0,
              totalEngagement: 0,
              averageEngagementRate: 0,
            },
          };
        }

        // Calculate top viewed resources
        const topViewed = resources
          .filter(r => (r.view_count || 0) > 0)
          .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
          .slice(0, 5)
          .map(r => ({
            title: r.title.length > 25 ? r.title.substring(0, 25) + '...' : r.title,
            view_count: r.view_count || 0,
            resource_type: r.resource_type,
          }));

        // Calculate top downloaded resources
        const topDownloaded = resources
          .filter(r => (r.download_count || 0) > 0)
          .sort((a, b) => (b.download_count || 0) - (a.download_count || 0))
          .slice(0, 5)
          .map(r => ({
            title: r.title.length > 25 ? r.title.substring(0, 25) + '...' : r.title,
            download_count: r.download_count || 0,
            resource_type: r.resource_type,
          }));

        // Calculate engagement by resource type
        const typeMap = new Map<string, { views: number; downloads: number; count: number }>();
        resources.forEach(resource => {
          const type = resource.resource_type || 'other';
          const existing = typeMap.get(type) || { views: 0, downloads: 0, count: 0 };
          typeMap.set(type, {
            views: existing.views + (resource.view_count || 0),
            downloads: existing.downloads + (resource.download_count || 0),
            count: existing.count + 1,
          });
        });

        const engagementByType = Array.from(typeMap.entries()).map(([type, data]) => ({
          type: type.charAt(0).toUpperCase() + type.slice(1),
          views: data.views,
          downloads: data.downloads,
          engagement_rate: Math.round(((data.views + data.downloads) / data.count) * 100) / 100,
        }));

        // Get daily activity for the last 7 days
        const { data: interactions, error: interactionsError } = await supabase
          .from('event_resource_interactions')
          .select('interaction_type, created_at')
          .gte('created_at', subDays(new Date(), 7).toISOString());

        if (interactionsError) throw interactionsError;

        const dailyActivity = Array.from({ length: 7 }, (_, i) => {
          const date = subDays(new Date(), 6 - i);
          const dayStart = startOfDay(date);
          const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
          
          const dayInteractions = interactions?.filter(i => {
            const interactionDate = new Date(i.created_at);
            return interactionDate >= dayStart && interactionDate < dayEnd;
          }) || [];

          return {
            date: format(date, 'MMM dd'),
            views: dayInteractions.filter(i => i.interaction_type === 'view').length,
            downloads: dayInteractions.filter(i => i.interaction_type === 'download').length,
          };
        });

        // Calculate conversion rates by type
        const conversionRates = Array.from(typeMap.entries()).map(([type, data]) => ({
          type: type.charAt(0).toUpperCase() + type.slice(1),
          conversion_rate: data.views > 0 ? Math.round((data.downloads / data.views) * 100) : 0,
        }));

        // Calculate total stats
        const totalViews = resources.reduce((sum, r) => sum + (r.view_count || 0), 0);
        const totalDownloads = resources.reduce((sum, r) => sum + (r.download_count || 0), 0);
        const totalEngagement = totalViews + totalDownloads;
        const averageEngagementRate = resources.length > 0 
          ? Math.round((totalEngagement / resources.length) * 100) / 100 
          : 0;

        return {
          topViewed,
          topDownloaded,
          engagementByType,
          dailyActivity,
          conversionRates,
          totalStats: {
            totalViews,
            totalDownloads,
            totalEngagement,
            averageEngagementRate,
          },
        };
      } catch (error) {
        console.error('Error fetching resource analytics:', error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg animate-pulse border"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-80 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg animate-pulse border"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics || analytics.totalStats.totalEngagement === 0) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ColorfulStatCard
            title="Total Views"
            value={0}
            icon={<Eye className="h-5 w-5" />}
            variant="blue"
            footer="resource views"
          />
          <ColorfulStatCard
            title="Total Downloads"
            value={0}
            icon={<Download className="h-5 w-5" />}
            variant="green"
            footer="file downloads"
          />
          <ColorfulStatCard
            title="Total Engagement"
            value={0}
            icon={<Activity className="h-5 w-5" />}
            variant="purple"
            footer="views + downloads"
          />
          <ColorfulStatCard
            title="Avg. Engagement"
            value="0"
            icon={<TrendingUp className="h-5 w-5" />}
            variant="orange"
            footer="per resource"
          />
        </div>
        
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-dashed">
          <CardContent className="py-12 text-center">
            <Activity className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Resource Activity Yet
            </h3>
            <p className="text-gray-600 mb-4">
              Analytics will appear once users start viewing and downloading resources.
            </p>
            <Button variant="outline" onClick={() => refetch()} disabled={isRefetching}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
              Check Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Resource Engagement Analytics</h3>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isRefetching}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ColorfulStatCard
          title="Total Views"
          value={analytics.totalStats.totalViews.toLocaleString()}
          icon={<Eye className="h-5 w-5" />}
          variant="blue"
          footer="resource views"
        />
        
        <ColorfulStatCard
          title="Total Downloads"
          value={analytics.totalStats.totalDownloads.toLocaleString()}
          icon={<Download className="h-5 w-5" />}
          variant="green"
          footer="file downloads"
        />
        
        <ColorfulStatCard
          title="Total Engagement"
          value={analytics.totalStats.totalEngagement.toLocaleString()}
          icon={<Activity className="h-5 w-5" />}
          variant="purple"
          footer="views + downloads"
        />
        
        <ColorfulStatCard
          title="Avg. Engagement"
          value={analytics.totalStats.averageEngagementRate}
          icon={<TrendingUp className="h-5 w-5" />}
          variant="orange"
          footer="per resource"
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Top Viewed Resources */}
        {analytics.topViewed.length > 0 && (
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <div className="p-2 bg-blue-200 rounded-full">
                  <Eye className="h-4 w-4" />
                </div>
                Most Viewed Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={analytics.topViewed} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis 
                    type="category" 
                    dataKey="title" 
                    width={100} 
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="view_count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Top Downloaded Resources */}
        {analytics.topDownloaded.length > 0 && (
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-green-700">
                <div className="p-2 bg-green-200 rounded-full">
                  <Download className="h-4 w-4" />
                </div>
                Most Downloaded Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={analytics.topDownloaded} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis 
                    type="category" 
                    dataKey="title" 
                    width={100} 
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="download_count" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Daily Activity Trend */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <div className="p-2 bg-purple-200 rounded-full">
                <Clock className="h-4 w-4" />
              </div>
              7-Day Activity Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={analytics.dailyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="views" stroke="#8b5cf6" strokeWidth={2} />
                <Line type="monotone" dataKey="downloads" stroke="#06b6d4" strokeWidth={2} />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Engagement by Resource Type */}
        {analytics.engagementByType.length > 0 && (
          <Card className="md:col-span-2 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <div className="p-2 bg-orange-200 rounded-full">
                  <TrendingUp className="h-4 w-4" />
                </div>
                Engagement by Resource Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={analytics.engagementByType}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                  <XAxis dataKey="type" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="views" fill="#f97316" name="Views" />
                  <Bar dataKey="downloads" fill="#06b6d4" name="Downloads" />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Conversion Rates */}
        {analytics.conversionRates.length > 0 && (
          <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-cyan-700">
                <div className="p-2 bg-cyan-200 rounded-full">
                  <Users className="h-4 w-4" />
                </div>
                Download Conversion Rates
              </CardTitle>
              <p className="text-sm text-cyan-600">Downloads per 100 views</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={analytics.conversionRates}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    dataKey="conversion_rate"
                    nameKey="type"
                  >
                    {analytics.conversionRates.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={MODERN_COLORS[index % MODERN_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [`${value}%`, 'Conversion Rate']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
