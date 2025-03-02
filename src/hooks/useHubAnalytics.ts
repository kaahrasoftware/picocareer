
import { useState, useCallback, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { format, subMonths, subWeeks, subDays, subYears, parseISO } from 'date-fns';
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

  const fetchMetrics = useCallback(async () => {
    if (!hubId) return;

    try {
      // Calculate time range based on selected period
      const now = new Date();
      let startDate;
      
      switch (timePeriod) {
        case 'day':
          startDate = subDays(now, 7);
          break;
        case 'week':
          startDate = subWeeks(now, 12);
          break;
        case 'month':
          startDate = subMonths(now, 12);
          break;
        case 'year':
          startDate = subYears(now, 5);
          break;
        default:
          startDate = subMonths(now, 12);
      }

      // Fetch member growth for the selected period
      const { data: growthData, error: growthError } = await supabase
        .from('hub_member_growth')
        .select('*')
        .eq('hub_id', hubId)
        .gte('month', startDate.toISOString())
        .order('month', { ascending: true });

      if (growthError) throw growthError;

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

      setMemberGrowth(growthData || []);
    } catch (error) {
      console.error("Error fetching hub analytics:", error);
    }
  }, [hubId, timePeriod]);

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
