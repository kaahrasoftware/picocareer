
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MemberGrowth, AnalyticsSummary } from '@/types/database/analytics';
import { AnalyticsSummaryCards } from './AnalyticsSummaryCards';
import { EngagementMetrics } from './EngagementMetrics';
import { HubRecommendations } from './HubRecommendations';
import { format, subDays, subWeeks, subMonths, subYears, startOfDay, endOfDay, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, eachYearOfInterval, endOfMonth, endOfWeek, endOfYear } from 'date-fns';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface HubAnalyticsProps {
  hubId: string;
}

type TimePeriod = 'day' | 'week' | 'month' | 'year';

interface StorageMetrics {
  totalStorageBytes: number;
  fileCount: number;
  resourcesCount: number;
  logoCount: number;
  bannerCount: number;
  announcementsCount: number;
  lastCalculatedAt: string;
}

export function HubAnalytics({ hubId }: HubAnalyticsProps) {
  const [memberGrowth, setMemberGrowth] = useState<MemberGrowth[]>([]);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [storageMetrics, setStorageMetrics] = useState<StorageMetrics | null>(null);
  const [summary, setSummary] = useState<AnalyticsSummary>({
    totalMembers: 0,
    memberLimit: 100,
    activeMembers: 0,
    resourceCount: 0,
    announcementCount: 0,
    storageUsed: 0,
    storageLimit: 5368709120 // 5GB default
  });
  const { toast } = useToast();

  const getTimeRangeFilter = (period: TimePeriod) => {
    const now = new Date();
    switch (period) {
      case 'day':
        return subDays(now, 29);
      case 'week':
        return subWeeks(now, 11);
      case 'month':
        return subMonths(now, 11);
      case 'year':
        return subYears(now, 4);
      default:
        return subMonths(now, 11);
    }
  };

  const formatDate = (date: string, period: TimePeriod) => {
    switch (period) {
      case 'day':
        return format(new Date(date), 'MMM d');
      case 'week':
        return format(new Date(date), 'MMM d');
      case 'month':
        return format(new Date(date), 'MMM yyyy');
      case 'year':
        return format(new Date(date), 'yyyy');
      default:
        return format(new Date(date), 'MMM yyyy');
    }
  };

  const generateEmptyDataPoints = (startDate: Date, endDate: Date, period: TimePeriod) => {
    const datePoints = [];
    let interval;
    
    switch (period) {
      case 'day':
        interval = { start: startDate, end: endDate };
        break;
      case 'week':
        interval = { start: startDate, end: endOfWeek(endDate) };
        break;
      case 'month':
        interval = { start: startDate, end: endOfMonth(endDate) };
        break;
      case 'year':
        interval = { start: startDate, end: endOfYear(endDate) };
        break;
      default:
        interval = { start: startDate, end: endDate };
    }

    let dates;
    switch (period) {
      case 'day':
        dates = eachDayOfInterval(interval);
        break;
      case 'week':
        dates = eachWeekOfInterval(interval);
        break;
      case 'month':
        dates = eachMonthOfInterval(interval);
        break;
      case 'year':
        dates = eachYearOfInterval(interval);
        break;
      default:
        dates = eachMonthOfInterval(interval);
    }

    const dateFormat = period === 'day' ? 'yyyy-MM-dd' : 
                      period === 'week' ? 'yyyy-MM-dd' :
                      period === 'month' ? 'yyyy-MM' : 'yyyy';

    dates.forEach(date => {
      datePoints.push({
        month: format(date, dateFormat),
        new_members: 0,
        hub_id: hubId
      });
    });

    return datePoints;
  };

  const refreshMetrics = async () => {
    setIsRefreshing(true);
    try {
      const { data, error } = await supabase.rpc('refresh_hub_metrics', { hub_uuid: hubId });
      
      if (error) throw error;
      
      // Update the stored metrics
      if (data) {
        setSummary({
          totalMembers: data.member_metrics.total_members || 0,
          memberLimit: data.member_metrics.member_limit || 100,
          activeMembers: data.member_metrics.active_members || 0,
          resourceCount: data.storage_metrics.resources_count || 0,
          announcementCount: data.storage_metrics.announcements_count || 0,
          storageUsed: data.storage_metrics.total_storage_bytes || 0,
          storageLimit: data.storage_limit_bytes || 5368709120
        });
        
        setStorageMetrics({
          totalStorageBytes: data.storage_metrics.total_storage_bytes || 0,
          fileCount: data.storage_metrics.file_count || 0,
          resourcesCount: data.storage_metrics.resources_count || 0,
          logoCount: data.storage_metrics.logo_count || 0,
          bannerCount: data.storage_metrics.banner_count || 0,
          announcementsCount: data.storage_metrics.announcements_count || 0,
          lastCalculatedAt: data.storage_metrics.last_calculated_at || new Date().toISOString()
        });
      }
      
      toast({
        title: "Metrics refreshed",
        description: "Hub metrics have been recalculated successfully.",
      });
      
      // Fetch member growth data again to reflect any changes
      fetchAnalytics();
      
    } catch (error: any) {
      console.error('Error refreshing metrics:', error);
      toast({
        title: "Error refreshing metrics",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const startDate = getTimeRangeFilter(timePeriod);
      const endDate = new Date();
      
      // Generate empty data points for all possible dates in the range
      const emptyDataPoints = generateEmptyDataPoints(startDate, endDate, timePeriod);
      
      // Fetch member metrics
      const { data: memberMetrics, error: memberMetricsError } = await supabase
        .from('hub_member_metrics')
        .select('*')
        .eq('hub_id', hubId)
        .single();

      if (memberMetricsError) throw memberMetricsError;

      // Fetch storage metrics
      const { data: storageMetrics, error: storageError } = await supabase
        .from('hub_storage_metrics')
        .select('*')
        .eq('hub_id', hubId)
        .single();

      if (storageError) throw storageError;

      // Fetch resource count
      const { count: resourceCount, error: resourceError } = await supabase
        .from('hub_resources')
        .select('*', { count: 'exact', head: true })
        .eq('hub_id', hubId);

      if (resourceError) throw resourceError;

      // Fetch announcement count
      const { count: announcementCount, error: announcementError } = await supabase
        .from('hub_announcements')
        .select('*', { count: 'exact', head: true })
        .eq('hub_id', hubId);

      if (announcementError) throw announcementError;

      setSummary({
        totalMembers: memberMetrics?.total_members || 0,
        memberLimit: memberMetrics?.member_limit || 100,
        activeMembers: memberMetrics?.active_members || 0,
        resourceCount: resourceCount || 0,
        announcementCount: announcementCount || 0,
        storageUsed: storageMetrics?.total_storage_bytes || 0,
        storageLimit: storageMetrics?.storage_limit_bytes || 5368709120
      });

      setStorageMetrics(storageMetrics ? {
        totalStorageBytes: storageMetrics.total_storage_bytes || 0,
        fileCount: storageMetrics.file_count || 0,
        resourcesCount: storageMetrics.resources_count || 0,
        logoCount: storageMetrics.logo_count || 0,
        bannerCount: storageMetrics.banner_count || 0,
        announcementsCount: storageMetrics.announcements_count || 0,
        lastCalculatedAt: storageMetrics.last_calculated_at || new Date().toISOString()
      } : null);

      // Fetch members join dates
      const { data: memberData, error: memberGrowthError } = await supabase
        .from('hub_members')
        .select('join_date')
        .eq('hub_id', hubId)
        .eq('status', 'Approved')
        .gte('join_date', startOfDay(startDate).toISOString())
        .lte('join_date', endOfDay(endDate).toISOString());

      if (memberGrowthError) throw memberGrowthError;

      // Process member data into growth data
      const growthMap = new Map<string, number>();
      const dateFormat = timePeriod === 'day' ? 'yyyy-MM-dd' : 
                       timePeriod === 'week' ? 'yyyy-MM-dd' :
                       timePeriod === 'month' ? 'yyyy-MM' : 'yyyy';

      // Initialize the map with empty data points
      emptyDataPoints.forEach(point => {
        growthMap.set(point.month, 0);
      });

      // Add the actual member counts
      memberData?.forEach(member => {
        const date = format(new Date(member.join_date), dateFormat);
        growthMap.set(date, (growthMap.get(date) || 0) + 1);
      });

      // Convert the map to array and sort
      const growthData = emptyDataPoints.map(point => ({
        ...point,
        new_members: growthMap.get(point.month) || 0
      }));

      setMemberGrowth(growthData);

    } catch (error: any) {
      toast({
        title: "Error fetching analytics",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [hubId, timePeriod, toast]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Hub Analytics</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refreshMetrics} 
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh Metrics'}
        </Button>
      </div>

      <AnalyticsSummaryCards summary={summary} />
      
      <Tabs defaultValue="growth" className="w-full">
        <TabsList>
          <TabsTrigger value="growth">Member Growth</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="growth">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Member Growth Over Time</CardTitle>
                <ToggleGroup type="single" value={timePeriod} onValueChange={(value: TimePeriod) => setTimePeriod(value)}>
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

          {storageMetrics && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Storage Usage Details</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Last calculated: {format(new Date(storageMetrics.lastCalculatedAt), 'PPpp')}
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="font-medium text-sm">Resources</h3>
                    <p className="text-2xl font-bold">{storageMetrics.resourcesCount}</p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="font-medium text-sm">Media Files</h3>
                    <p className="text-2xl font-bold">{storageMetrics.logoCount + storageMetrics.bannerCount}</p>
                    <div className="flex flex-col mt-2 text-xs text-muted-foreground">
                      <span>Logos: {storageMetrics.logoCount}</span>
                      <span>Banners: {storageMetrics.bannerCount}</span>
                    </div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="font-medium text-sm">Announcements</h3>
                    <p className="text-2xl font-bold">{storageMetrics.announcementsCount}</p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="font-medium text-sm">Total Files</h3>
                    <p className="text-2xl font-bold">{storageMetrics.fileCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="engagement">
          <EngagementMetrics hubId={hubId} />
        </TabsContent>

        <TabsContent value="recommendations">
          <HubRecommendations hubId={hubId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
