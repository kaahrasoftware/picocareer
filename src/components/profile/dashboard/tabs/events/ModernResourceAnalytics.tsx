import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ModernAnalyticsCard } from '@/components/ui/modern-analytics-card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend, Area, AreaChart } from 'recharts';
import { 
  Eye, Download, TrendingUp, Clock, Users, Activity, RefreshCw, 
  Target, Zap, Calendar, BarChart3, PieChart as PieChartIcon,
  ArrowUpRight, ArrowDownRight, AlertTriangle, CheckCircle,
  Timer, MousePointer, Heart, Share2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfDay, eachDayOfInterval } from 'date-fns';

interface ModernResourceAnalyticsProps {
  className?: string;
}

const MODERN_COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f97316', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6'];

interface AnalyticsData {
  totalViews: number;
  totalDownloads: number;
  engagementRate: number;
  activeResources: number;
  averageSessionTime: number;
  resourceHealthScore: number;
  peakHour: string;
  userRetentionRate: number;
  conversionRate: number;
  mostPopularType: string;
  trends: {
    views: number;
    downloads: number;
    engagement: number;
  };
  dailyActivity: Array<{
    date: string;
    views: number;
    downloads: number;
    uniqueUsers: number;
  }>;
  resourceTypes: Array<{
    type: string;
    views: number;
    downloads: number;
    engagement: number;
    count: number;
  }>;
  hourlyActivity: Array<{
    hour: number;
    activity: number;
  }>;
  topResources: Array<{
    title: string;
    views: number;
    downloads: number;
    type: string;
  }>;
}

export function ModernResourceAnalytics({ className }: ModernResourceAnalyticsProps) {
  const { data: analytics, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['modern-resource-analytics'],
    queryFn: async (): Promise<AnalyticsData> => {
      console.log('🔍 Starting modern resource analytics fetch...');
      
      try {
        // Get all resources with engagement data
        console.log('📊 Fetching event resources...');
        const { data: resources, error: resourcesError } = await supabase
          .from('event_resources')
          .select(`
            id,
            title,
            resource_type,
            view_count,
            download_count,
            unique_viewers,
            unique_downloaders,
            last_viewed_at,
            last_downloaded_at,
            created_at
          `)
          .order('view_count', { ascending: false });

        if (resourcesError) {
          console.error('❌ Error fetching resources:', resourcesError);
          throw resourcesError;
        }

        console.log(`📈 Found ${resources?.length || 0} resources:`, resources);

        if (!resources || resources.length === 0) {
          console.log('⚠️ No resources found, returning empty analytics');
          return {
            totalViews: 0,
            totalDownloads: 0,
            engagementRate: 0,
            activeResources: 0,
            averageSessionTime: 0,
            resourceHealthScore: 0,
            peakHour: '12:00',
            userRetentionRate: 0,
            conversionRate: 0,
            mostPopularType: 'document',
            trends: { views: 0, downloads: 0, engagement: 0 },
            dailyActivity: [],
            resourceTypes: [],
            hourlyActivity: [],
            topResources: []
          };
        }

        // Debug: Log each resource's view and download counts
        resources.forEach((resource, index) => {
          console.log(`📋 Resource ${index + 1}: "${resource.title}" - Views: ${resource.view_count || 0}, Downloads: ${resource.download_count || 0}`);
        });

        // Get interactions for the last 30 days
        const thirtyDaysAgo = subDays(new Date(), 30);
        console.log('🔄 Fetching interactions since:', thirtyDaysAgo.toISOString());
        
        const { data: interactions, error: interactionsError } = await supabase
          .from('event_resource_interactions')
          .select('interaction_type, created_at, resource_id, profile_id')
          .gte('created_at', thirtyDaysAgo.toISOString());

        if (interactionsError) {
          console.error('❌ Error fetching interactions:', interactionsError);
          throw interactionsError;
        }

        console.log(`🎯 Found ${interactions?.length || 0} interactions:`, interactions);

        // Get interactions for the previous 30 days for trend calculation
        const sixtyDaysAgo = subDays(new Date(), 60);
        const { data: previousInteractions, error: previousInteractionsError } = await supabase
          .from('event_resource_interactions')
          .select('interaction_type, created_at, resource_id, profile_id')
          .gte('created_at', sixtyDaysAgo.toISOString())
          .lt('created_at', thirtyDaysAgo.toISOString());

        if (previousInteractionsError) {
          console.error('❌ Error fetching previous interactions:', previousInteractionsError);
          throw previousInteractionsError;
        }

        // Calculate basic metrics with detailed logging
        console.log('🧮 Calculating basic metrics...');
        
        const totalViews = resources.reduce((sum, r) => {
          const views = r.view_count || 0;
          console.log(`   Adding ${views} views from "${r.title}"`);
          return sum + views;
        }, 0);
        
        const totalDownloads = resources.reduce((sum, r) => {
          const downloads = r.download_count || 0;
          console.log(`   Adding ${downloads} downloads from "${r.title}"`);
          return sum + downloads;
        }, 0);
        
        console.log(`📊 Total calculated views: ${totalViews}`);
        console.log(`📊 Total calculated downloads: ${totalDownloads}`);
        
        const totalUniqueViewers = resources.reduce((sum, r) => sum + (r.unique_viewers || 0), 0);
        const totalUniqueDownloaders = resources.reduce((sum, r) => sum + (r.unique_downloaders || 0), 0);
        
        // Calculate engagement rate (downloads per 100 views)
        const engagementRate = totalViews > 0 ? Math.round((totalDownloads / totalViews) * 100) : 0;
        console.log(`📈 Engagement rate: ${engagementRate}% (${totalDownloads}/${totalViews})`);
        
        // Calculate conversion rate (unique downloaders / unique viewers)
        const conversionRate = totalUniqueViewers > 0 ? Math.round((totalUniqueDownloaders / totalUniqueViewers) * 100) : 0;
        
        // Calculate active resources (resources with activity in last 7 days)
        const sevenDaysAgo = subDays(new Date(), 7);
        const activeResources = resources.filter(r => 
          (r.last_viewed_at && new Date(r.last_viewed_at) > sevenDaysAgo) ||
          (r.last_downloaded_at && new Date(r.last_downloaded_at) > sevenDaysAgo)
        ).length;

        console.log(`🎯 Active resources: ${activeResources}/${resources.length}`);

        // Calculate resource health score (composite metric)
        const avgViewsPerResource = totalViews / resources.length;
        const avgDownloadsPerResource = totalDownloads / resources.length;
        const activeResourcesRatio = activeResources / resources.length;
        const resourceHealthScore = Math.round(
          (Math.min(avgViewsPerResource, 100) * 0.3) +
          (Math.min(avgDownloadsPerResource, 50) * 0.3) +
          (activeResourcesRatio * 100 * 0.4)
        );

        console.log(`💚 Resource health score: ${resourceHealthScore}`);

        // Calculate hourly activity
        const hourlyActivity = Array.from({ length: 24 }, (_, hour) => {
          const hourInteractions = interactions?.filter(i => 
            new Date(i.created_at).getHours() === hour
          ).length || 0;
          return { hour, activity: hourInteractions };
        });

        const peakHour = hourlyActivity.reduce((max, current) => 
          current.activity > max.activity ? current : max
        );

        // Calculate daily activity for the last 7 days
        const last7Days = eachDayOfInterval({
          start: subDays(new Date(), 6),
          end: new Date()
        });

        const dailyActivity = last7Days.map(date => {
          const dayStart = startOfDay(date);
          const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
          
          const dayInteractions = interactions?.filter(i => {
            const interactionDate = new Date(i.created_at);
            return interactionDate >= dayStart && interactionDate < dayEnd;
          }) || [];

          const uniqueUsers = new Set(dayInteractions.map(i => i.profile_id)).size;

          return {
            date: format(date, 'MMM dd'),
            views: dayInteractions.filter(i => i.interaction_type === 'view').length,
            downloads: dayInteractions.filter(i => i.interaction_type === 'download').length,
            uniqueUsers
          };
        });

        // Calculate resource type breakdown
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

        const resourceTypes = Array.from(typeMap.entries()).map(([type, data]) => ({
          type: type.charAt(0).toUpperCase() + type.slice(1),
          views: data.views,
          downloads: data.downloads,
          engagement: data.views > 0 ? Math.round((data.downloads / data.views) * 100) : 0,
          count: data.count
        }));

        const mostPopularType = resourceTypes.reduce((max, current) => 
          current.views > max.views ? current : max, resourceTypes[0]
        )?.type || 'document';

        // Get top 5 resources
        const topResources = resources
          .slice(0, 5)
          .map(r => ({
            title: r.title.length > 30 ? r.title.substring(0, 30) + '...' : r.title,
            views: r.view_count || 0,
            downloads: r.download_count || 0,
            type: r.resource_type || 'document'
          }));

        // Calculate trends based on actual data comparison
        const currentPeriodViews = interactions?.filter(i => i.interaction_type === 'view').length || 0;
        const previousPeriodViews = previousInteractions?.filter(i => i.interaction_type === 'view').length || 0;
        const currentPeriodDownloads = interactions?.filter(i => i.interaction_type === 'download').length || 0;
        const previousPeriodDownloads = previousInteractions?.filter(i => i.interaction_type === 'download').length || 0;

        const viewsTrend = previousPeriodViews > 0 
          ? Math.round(((currentPeriodViews - previousPeriodViews) / previousPeriodViews) * 100)
          : currentPeriodViews > 0 ? 100 : 0;

        const downloadsTrend = previousPeriodDownloads > 0 
          ? Math.round(((currentPeriodDownloads - previousPeriodDownloads) / previousPeriodDownloads) * 100)
          : currentPeriodDownloads > 0 ? 100 : 0;

        const currentEngagement = currentPeriodViews > 0 ? (currentPeriodDownloads / currentPeriodViews) * 100 : 0;
        const previousEngagement = previousPeriodViews > 0 ? (previousPeriodDownloads / previousPeriodViews) * 100 : 0;
        const engagementTrend = previousEngagement > 0 
          ? Math.round(((currentEngagement - previousEngagement) / previousEngagement) * 100)
          : currentEngagement > 0 ? 100 : 0;

        const trends = {
          views: Math.max(-100, Math.min(100, viewsTrend)), // Cap between -100% and +100%
          downloads: Math.max(-100, Math.min(100, downloadsTrend)),
          engagement: Math.max(-100, Math.min(100, engagementTrend))
        };

        // Calculate average session time based on interaction patterns
        const userSessions = new Map<string, { start: Date; end: Date }>();
        interactions?.forEach(interaction => {
          if (!interaction.profile_id) return;
          
          const interactionDate = new Date(interaction.created_at);
          const existing = userSessions.get(interaction.profile_id);
          
          if (!existing) {
            userSessions.set(interaction.profile_id, {
              start: interactionDate,
              end: interactionDate
            });
          } else {
            if (interactionDate < existing.start) existing.start = interactionDate;
            if (interactionDate > existing.end) existing.end = interactionDate;
          }
        });

        const sessionDurations = Array.from(userSessions.values())
          .map(session => (session.end.getTime() - session.start.getTime()) / 1000)
          .filter(duration => duration > 0 && duration < 3600); // Filter out sessions longer than 1 hour

        const averageSessionTime = sessionDurations.length > 0
          ? Math.round(sessionDurations.reduce((sum, duration) => sum + duration, 0) / sessionDurations.length)
          : 180; // Default to 3 minutes if no data

        // Calculate user retention rate based on users who had interactions in multiple days
        const userActivityDays = new Map<string, Set<string>>();
        interactions?.forEach(interaction => {
          if (!interaction.profile_id) return;
          
          const day = format(new Date(interaction.created_at), 'yyyy-MM-dd');
          if (!userActivityDays.has(interaction.profile_id)) {
            userActivityDays.set(interaction.profile_id, new Set());
          }
          userActivityDays.get(interaction.profile_id)!.add(day);
        });

        const returningUsers = Array.from(userActivityDays.values()).filter(days => days.size > 1).length;
        const totalUsers = userActivityDays.size;
        const userRetentionRate = totalUsers > 0 ? Math.round((returningUsers / totalUsers) * 100) : 0;

        const finalResult = {
          totalViews,
          totalDownloads,
          engagementRate,
          activeResources,
          averageSessionTime,
          resourceHealthScore,
          peakHour: `${peakHour.hour.toString().padStart(2, '0')}:00`,
          userRetentionRate,
          conversionRate,
          mostPopularType,
          trends,
          dailyActivity,
          resourceTypes,
          hourlyActivity,
          topResources
        };

        console.log('✅ Final analytics result:', finalResult);
        return finalResult;
      } catch (error) {
        console.error('💥 Error fetching modern resource analytics:', error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes to prevent constant refetching
  });

  const analyticsCards = useMemo(() => {
    console.log('🎨 Generating analytics cards with data:', analytics);
    
    if (!analytics) {
      console.log('⚠️ No analytics data available for cards');
      return [];
    }

    const cards = [
      {
        title: "Total Views",
        value: analytics.totalViews,
        subtitle: "Resource page views",
        icon: <Eye className="h-5 w-5" />,
        variant: 'blue' as const,
        trend: {
          value: analytics.trends.views,
          period: "vs last 30 days",
          isPositive: analytics.trends.views >= 0
        },
        explanation: {
          description: "Total number of times users have viewed your resources",
          importance: "Views indicate content discovery and initial interest",
          actionable: "Low views? Improve resource titles and descriptions",
          benchmark: {
            poor: "<100",
            average: "100-500",
            good: "500+"
          }
        }
      },
      {
        title: "Total Downloads",
        value: analytics.totalDownloads,
        subtitle: "Files downloaded",
        icon: <Download className="h-5 w-5" />,
        variant: 'green' as const,
        trend: {
          value: analytics.trends.downloads,
          period: "vs last 30 days",
          isPositive: analytics.trends.downloads >= 0
        },
        explanation: {
          description: "Number of successful file downloads by users",
          importance: "Downloads show actual resource utilization and value",
          actionable: "Boost downloads with clear file descriptions and formats",
          benchmark: {
            poor: "<50",
            average: "50-200",
            good: "200+"
          }
        }
      },
      {
        title: "Engagement Rate",
        value: `${analytics.engagementRate}%`,
        subtitle: "Downloads per 100 views",
        icon: <Target className="h-5 w-5" />,
        variant: 'purple' as const,
        trend: {
          value: analytics.trends.engagement,
          period: "vs last 30 days",
          isPositive: analytics.trends.engagement >= 0
        },
        explanation: {
          description: "Percentage of viewers who download resources",
          importance: "Higher rates indicate valuable, well-presented content",
          actionable: "Improve thumbnails and descriptions to boost engagement",
          benchmark: {
            poor: "<15%",
            average: "15-30%",
            good: "30%+"
          }
        }
      },
      {
        title: "Active Resources",
        value: analytics.activeResources,
        subtitle: "With recent activity",
        icon: <Activity className="h-5 w-5" />,
        variant: 'orange' as const,
        explanation: {
          description: "Resources accessed in the last 7 days",
          importance: "Shows which content remains relevant and useful",
          actionable: "Update or promote inactive resources"
        }
      },
      {
        title: "Avg. Session Time",
        value: `${Math.floor(analytics.averageSessionTime / 60)}m ${analytics.averageSessionTime % 60}s`,
        subtitle: "Time spent per visit",
        icon: <Clock className="h-5 w-5" />,
        variant: 'cyan' as const,
        explanation: {
          description: "Average time users spend viewing resources",
          importance: "Longer sessions indicate engaging, valuable content",
          actionable: "Create resource previews to increase session time"
        }
      },
      {
        title: "Resource Health Score",
        value: analytics.resourceHealthScore,
        subtitle: "Overall performance",
        icon: <Heart className="h-5 w-5" />,
        variant: 'pink' as const,
        progress: {
          value: analytics.resourceHealthScore,
          max: 100,
          label: "Health Score"
        },
        explanation: {
          description: "Composite score based on views, downloads, and activity",
          importance: "Indicates overall content library performance",
          actionable: "Focus on uploading high-quality, relevant resources",
          benchmark: {
            poor: "<40",
            average: "40-70",
            good: "70+"
          }
        }
      },
      {
        title: "Peak Activity",
        value: analytics.peakHour,
        subtitle: "Most active hour",
        icon: <BarChart3 className="h-5 w-5" />,
        variant: 'indigo' as const,
        explanation: {
          description: "Hour of day with highest resource activity",
          importance: "Helps optimize posting times for maximum visibility",
          actionable: "Schedule new resource uploads near peak hours"
        }
      },
      {
        title: "User Retention",
        value: `${analytics.userRetentionRate}%`,
        subtitle: "Return visitors",
        icon: <Users className="h-5 w-5" />,
        variant: 'emerald' as const,
        explanation: {
          description: "Percentage of users who return to view more resources",
          importance: "High retention indicates valuable content library",
          actionable: "Create resource series to encourage return visits"
        }
      }
    ];

    console.log('🎯 Generated analytics cards:', cards);
    return cards;
  }, [analytics]);

  if (isLoading) {
    return (
      <div className={className}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <ModernAnalyticsCard
              key={i}
              title=""
              value=""
              icon={<Activity className="h-5 w-5" />}
              variant="blue"
              explanation={{ description: "", importance: "" }}
              loading={true}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!analytics || analytics.totalViews === 0) {
    return (
      <div className={className}>
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-dashed">
          <CardContent className="py-12 text-center">
            <Activity className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Resource Activity Yet
            </h3>
            <p className="text-gray-600 mb-4">
              Start uploading resources and analytics will appear here.
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
    <div className={className}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Resource Analytics Dashboard</h3>
          <p className="text-gray-600">Comprehensive insights into your resource performance</p>
        </div>
        <Button variant="outline" onClick={() => refetch()} disabled={isRefetching}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {analyticsCards.map((card, index) => (
          <ModernAnalyticsCard key={index} {...card} />
        ))}
      </div>

      {/* Advanced Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Daily Activity Trend */}
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              7-Day Activity Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={analytics.dailyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Area type="monotone" dataKey="views" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="downloads" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Resource Type Performance */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-green-600" />
              Resource Type Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={analytics.resourceTypes}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="views"
                  nameKey="type"
                >
                  {analytics.resourceTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={MODERN_COLORS[index % MODERN_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [value, 'Views']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Hourly Activity Heatmap */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            Hourly Activity Pattern
          </CardTitle>
          <p className="text-sm text-gray-600">Peak activity time: {analytics.peakHour}</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={analytics.hourlyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="hour" 
                tick={{ fontSize: 11 }}
                tickFormatter={(hour) => `${hour.toString().padStart(2, '0')}:00`}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                labelFormatter={(hour) => `${hour.toString().padStart(2, '0')}:00`}
                formatter={(value: any) => [value, 'Activity']}
              />
              <Bar dataKey="activity" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Performing Resources */}
      {analytics.topResources.length > 0 && (
        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5 text-orange-600" />
              Top Performing Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topResources.map((resource, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-100">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs">
                      #{index + 1}
                    </Badge>
                    <div>
                      <p className="font-medium text-gray-900">{resource.title}</p>
                      <p className="text-xs text-gray-500 capitalize">{resource.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-blue-600">
                      <Eye className="h-3 w-3" />
                      {resource.views}
                    </div>
                    <div className="flex items-center gap-1 text-green-600">
                      <Download className="h-3 w-3" />
                      {resource.downloads}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
