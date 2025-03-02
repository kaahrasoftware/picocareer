
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MemberGrowth, AnalyticsSummary, HubStorageMetrics, HubMemberMetrics } from '@/types/database/analytics';
import { format, subDays, subWeeks, subMonths, subYears, startOfDay, endOfDay, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, eachYearOfInterval, endOfMonth, endOfWeek, endOfYear } from 'date-fns';

export type TimePeriod = 'day' | 'week' | 'month' | 'year';

export function useHubAnalytics(hubId: string, timePeriod: TimePeriod) {
  const [memberGrowth, setMemberGrowth] = useState<MemberGrowth[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [storageMetrics, setStorageMetrics] = useState<HubStorageMetrics | null>(null);
  const [memberMetrics, setMemberMetrics] = useState<HubMemberMetrics | null>(null);
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
      
      if (data) {
        const { data: hubData, error: hubError } = await supabase
          .from('hubs')
          .select('member_limit, storage_limit_bytes')
          .eq('id', hubId)
          .single();
          
        if (hubError) throw hubError;
        
        setSummary({
          totalMembers: data.member_metrics.total_members || 0,
          memberLimit: hubData.member_limit || 100,
          activeMembers: data.member_metrics.active_members || 0,
          resourceCount: data.storage_metrics.resources_count || 0,
          announcementCount: data.storage_metrics.announcements_count || 0,
          storageUsed: data.storage_metrics.total_storage_bytes || 0,
          storageLimit: hubData.storage_limit_bytes || 5368709120
        });
        
        setStorageMetrics({
          total_storage_bytes: data.storage_metrics.total_storage_bytes || 0,
          file_count: data.storage_metrics.file_count || 0,
          resources_count: data.storage_metrics.resources_count || 0,
          logo_count: data.storage_metrics.logo_count || 0,
          banner_count: data.storage_metrics.banner_count || 0,
          announcements_count: data.storage_metrics.announcements_count || 0,
          last_calculated_at: data.storage_metrics.last_calculated_at || new Date().toISOString(),
          storage_limit_bytes: hubData.storage_limit_bytes
        });
        
        setMemberMetrics({
          total_members: data.member_metrics.total_members || 0,
          active_members: data.member_metrics.active_members || 0,
          member_limit: hubData.member_limit || 100
        });
      }
      
      toast({
        title: "Metrics refreshed",
        description: "Hub metrics have been recalculated successfully.",
      });
      
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
      
      const emptyDataPoints = generateEmptyDataPoints(startDate, endDate, timePeriod);
      
      const { data: hubData, error: hubError } = await supabase
        .from('hubs')
        .select('current_storage_usage, current_member_count, storage_limit_bytes, member_limit')
        .eq('id', hubId)
        .single();
        
      if (hubError) throw hubError;
      
      const { data: storageMetricsData, error: storageError } = await supabase
        .from('hub_storage_metrics')
        .select('*')
        .eq('hub_id', hubId)
        .single();

      if (storageError && storageError.code !== 'PGRST116') throw storageError;

      const { data: memberMetricsData, error: memberMetricsError } = await supabase
        .from('hub_member_metrics')
        .select('*')
        .eq('hub_id', hubId)
        .single();

      if (memberMetricsError && memberMetricsError.code !== 'PGRST116') throw memberMetricsError;

      if (memberMetricsData) {
        setMemberMetrics({
          total_members: memberMetricsData.total_members || 0,
          active_members: memberMetricsData.active_members || 0,
          member_limit: hubData.member_limit || 100
        });
      }

      if (storageMetricsData) {
        setStorageMetrics({
          total_storage_bytes: storageMetricsData.total_storage_bytes || 0,
          file_count: storageMetricsData.file_count || 0,
          resources_count: storageMetricsData.resources_count || 0,
          logo_count: storageMetricsData.logo_count || 0,
          banner_count: storageMetricsData.banner_count || 0,
          announcements_count: storageMetricsData.announcements_count || 0,
          last_calculated_at: storageMetricsData.last_calculated_at || new Date().toISOString(),
          storage_limit_bytes: hubData.storage_limit_bytes
        });
      }

      setSummary({
        totalMembers: memberMetricsData?.total_members || hubData?.current_member_count || 0,
        memberLimit: hubData?.member_limit || 100,
        activeMembers: memberMetricsData?.active_members || hubData?.current_member_count || 0,
        resourceCount: storageMetricsData?.resources_count || 0,
        announcementCount: storageMetricsData?.announcements_count || 0,
        storageUsed: storageMetricsData?.total_storage_bytes || hubData?.current_storage_usage || 0,
        storageLimit: hubData?.storage_limit_bytes || 5368709120
      });

      if (storageMetricsData && 
          hubData && 
          storageMetricsData.total_storage_bytes !== hubData.current_storage_usage) {
        
        await updateHubStorageUsage(hubId);
      }

      const { data: memberData, error: memberGrowthError } = await supabase
        .from('hub_members')
        .select('join_date')
        .eq('hub_id', hubId)
        .eq('status', 'Approved')
        .gte('join_date', startOfDay(startDate).toISOString())
        .lte('join_date', endOfDay(endDate).toISOString());

      if (memberGrowthError) throw memberGrowthError;

      const growthMap = new Map<string, number>();
      const dateFormat = timePeriod === 'day' ? 'yyyy-MM-dd' : 
                         timePeriod === 'week' ? 'yyyy-MM-dd' :
                         timePeriod === 'month' ? 'yyyy-MM' : 'yyyy';

      emptyDataPoints.forEach(point => {
        growthMap.set(point.month, 0);
      });

      memberData?.forEach(member => {
        const date = format(new Date(member.join_date), dateFormat);
        growthMap.set(date, (growthMap.get(date) || 0) + 1);
      });

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

  const updateHubStorageUsage = async (hubId: string) => {
    try {
      const { error } = await supabase
        .from('hubs')
        .update({ 
          current_storage_usage: storageMetrics?.total_storage_bytes || 0
        })
        .eq('id', hubId);
        
      if (error) {
        console.error('Error updating hub storage usage:', error);
      }
    } catch (error: any) {
      console.error('Error updating hub storage usage:', error);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [hubId, timePeriod]);

  return {
    memberGrowth,
    timePeriod,
    isRefreshing,
    storageMetrics,
    memberMetrics,
    summary,
    refreshMetrics,
    formatDate
  };
}
