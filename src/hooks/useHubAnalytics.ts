
import { useState, useCallback, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { format, subMonths, subWeeks, subDays, subYears, parseISO, startOfDay, endOfDay, eachDayOfInterval } from 'date-fns';
import { HubStorageMetrics, HubMemberMetrics, MemberGrowth, AnalyticsSummary } from '@/types/database/analytics';

export type TimePeriod = 'day' | 'week' | 'month' | 'year';

// Define the response type from the refresh_hub_metrics function
interface RefreshHubMetricsResponse {
  storage_metrics: {
    total_storage_bytes: number;
    file_count: number;
    resources_count: number;
    logo_count: number;
    banner_count: number;
    announcements_count: number;
    last_calculated_at: string;
    storage_limit_bytes: number;
  };
  member_metrics: {
    total_members: number;
    active_members: number;
    member_limit: number;
  };
}

export function useHubAnalytics(hubId: string, initialPeriod: TimePeriod = 'month') {
  const [memberGrowth, setMemberGrowth] = useState<MemberGrowth[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [storageMetrics, setStorageMetrics] = useState<HubStorageMetrics | null>(null);
  const [summary, setSummary] = useState<AnalyticsSummary>({
    totalMembers: 0,
    memberLimit: 100,
    activeMembers: 0,
    resourceCount: 0,
    announcementCount: 0,
    storageUsed: 0,
    storageLimit: 5 * 1024 * 1024 * 1024, // 5GB default
  });
  const [timePeriod, setTimePeriod] = useState<TimePeriod>(initialPeriod);

  // Format date based on selected period
  const formatDate = useCallback((dateStr: string, period: TimePeriod): string => {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr);
    switch (period) {
      case 'day':
        return format(date, 'MMM d, h a');
      case 'week':
        return format(date, 'MMM d');
      case 'month':
        return format(date, 'MMM yyyy');
      case 'year':
        return format(date, 'yyyy');
      default:
        return format(date, 'MMM d, yyyy');
    }
  }, []);

  const fetchDailyData = useCallback(async () => {
    if (!hubId) return [];
    
    const now = new Date();
    const startDate = subDays(now, 30); // Show 30 days
    
    try {
      // Fetch all hub members who joined in the last 30 days
      const { data: memberData, error: memberError } = await supabase
        .from('hub_members')
        .select('id, join_date')
        .eq('hub_id', hubId)
        .gte('join_date', startOfDay(startDate).toISOString())
        .lte('join_date', endOfDay(now).toISOString())
        .order('join_date', { ascending: true });
        
      if (memberError) {
        console.error('Error fetching member data:', memberError);
        return [];
      }
      
      // Generate an array of all days in the range
      const daysRange = eachDayOfInterval({ start: startDate, end: now });
      
      // Initialize counts for each day
      const dailyMap: Record<string, number> = {};
      daysRange.forEach(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        dailyMap[dateStr] = 0;
      });
      
      // Count signups by date
      if (memberData) {
        memberData.forEach(member => {
          const date = format(new Date(member.join_date), 'yyyy-MM-dd');
          dailyMap[date] = (dailyMap[date] || 0) + 1;
        });
      }
      
      // Convert map to array of MemberGrowth objects
      const dailyData = Object.entries(dailyMap).map(([date, count]) => ({
        hub_id: hubId,
        date: date,
        month: date, // For compatibility with existing UI
        new_members: count
      })).sort((a, b) => a.date.localeCompare(b.date));
      
      return dailyData;
    } catch (error) {
      console.error('Error generating daily member growth data:', error);
      return [];
    }
  }, [hubId]);

  const fetchMetrics = useCallback(async () => {
    if (!hubId) return;

    try {
      // Calculate time range based on selected period
      const now = new Date();
      let startDate;
      let data: MemberGrowth[] = [];
      
      // Update to fetch the appropriate amount of data based on timePeriod
      switch (timePeriod) {
        case 'day':
          data = await fetchDailyData();
          break;
        case 'week':
          startDate = subWeeks(now, 12); // Show 12 weeks
          const { data: weekData, error: weekError } = await supabase
            .from('hub_member_growth')
            .select('*')
            .eq('hub_id', hubId)
            .gte('month', startDate.toISOString())
            .order('month', { ascending: true });
            
          if (weekError) throw weekError;
          data = weekData || [];
          break;
        case 'month':
          startDate = subMonths(now, 12); // Show 12 months
          const { data: monthData, error: monthError } = await supabase
            .from('hub_member_growth')
            .select('*')
            .eq('hub_id', hubId)
            .gte('month', startDate.toISOString())
            .order('month', { ascending: true });
            
          if (monthError) throw monthError;
          data = monthData || [];
          break;
        case 'year':
          startDate = subYears(now, 5); // Show 5 years
          const { data: yearData, error: yearError } = await supabase
            .from('hub_member_growth')
            .select('*')
            .eq('hub_id', hubId)
            .gte('month', startDate.toISOString())
            .order('month', { ascending: true });
            
          if (yearError) throw yearError;
          data = yearData || [];
          break;
        default:
          startDate = subMonths(now, 12);
          const { data: defaultData, error: defaultError } = await supabase
            .from('hub_member_growth')
            .select('*')
            .eq('hub_id', hubId)
            .gte('month', startDate.toISOString())
            .order('month', { ascending: true });
            
          if (defaultError) throw defaultError;
          data = defaultData || [];
      }

      // Use the refresh_hub_metrics function to get consistent metrics
      const { data: metricsData, error: metricsError } = await supabase
        .rpc<RefreshHubMetricsResponse>('refresh_hub_metrics', { _hub_id: hubId });

      if (metricsError) throw metricsError;

      // Set state with fetched data
      if (metricsData) {
        const memberMetrics = metricsData.member_metrics;
        setSummary({
          totalMembers: memberMetrics.total_members,
          memberLimit: memberMetrics.member_limit || 100,
          activeMembers: memberMetrics.active_members,
          resourceCount: metricsData.storage_metrics.resources_count,
          announcementCount: metricsData.storage_metrics.announcements_count,
          storageUsed: metricsData.storage_metrics.total_storage_bytes,
          storageLimit: metricsData.storage_metrics.storage_limit_bytes || 5 * 1024 * 1024 * 1024, // Default to 5GB
        });

        setStorageMetrics({
          total_storage_bytes: metricsData.storage_metrics.total_storage_bytes,
          file_count: metricsData.storage_metrics.file_count,
          resources_count: metricsData.storage_metrics.resources_count,
          logo_count: metricsData.storage_metrics.logo_count,
          banner_count: metricsData.storage_metrics.banner_count,
          announcements_count: metricsData.storage_metrics.announcements_count,
          last_calculated_at: metricsData.storage_metrics.last_calculated_at,
          storage_limit_bytes: metricsData.storage_metrics.storage_limit_bytes
        });
      }

      setMemberGrowth(data || []);
    } catch (error) {
      console.error("Error fetching hub analytics:", error);
    }
  }, [hubId, timePeriod, fetchDailyData]);

  // Initial fetch and refresh when timePeriod changes
  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics, timePeriod]);

  // Function to manually refresh metrics
  const refreshMetrics = async () => {
    setIsRefreshing(true);
    try {
      await fetchMetrics();
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    memberGrowth,
    isRefreshing,
    storageMetrics,
    summary,
    timePeriod,
    setTimePeriod,
    refreshMetrics,
    formatDate
  };
}
