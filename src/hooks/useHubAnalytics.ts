
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { HubStorageMetrics, AnalyticsSummary, MemberGrowth } from '@/types/database/analytics';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

export type TimePeriod = 'last_7_days' | 'last_30_days' | 'last_90_days' | 'last_year' | 'month';

export function useHubAnalytics(hubId: string) {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch storage metrics
  const { data: storageMetrics } = useQuery({
    queryKey: ['hub-storage-metrics', hubId],
    queryFn: async (): Promise<HubStorageMetrics> => {
      const { data, error } = await supabase
        .from('hub_storage_metrics')
        .select('*')
        .eq('hub_id', hubId)
        .single();

      if (error) throw error;
      return data;
    }
  });

  // Calculate summary data
  const summary: AnalyticsSummary = {
    totalMembers: 0,
    memberLimit: 100,
    activeMembers: 0,
    resourceCount: storageMetrics?.resources_count || 0,
    totalResources: storageMetrics?.resources_count || 0,
    announcementCount: storageMetrics?.announcements_count || 0,
    totalAnnouncements: storageMetrics?.announcements_count || 0,
    storageUsed: storageMetrics?.total_storage_bytes || 0,
    storageLimit: 5368709120 // 5GB in bytes
  };

  // Fetch member growth data
  const { data: memberGrowth = [] } = useQuery({
    queryKey: ['hub-member-growth', hubId, timePeriod],
    queryFn: async (): Promise<MemberGrowth[]> => {
      const now = new Date();
      let startDate: Date;
      let dateFormat: string;

      switch (timePeriod) {
        case 'last_7_days':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          dateFormat = 'yyyy-MM-dd';
          break;
        case 'last_30_days':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          dateFormat = 'yyyy-MM-dd';
          break;
        case 'last_90_days':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          dateFormat = 'yyyy-MM';
          break;
        case 'last_year':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          dateFormat = 'yyyy-MM';
          break;
        default: // month
          startDate = subMonths(now, 11);
          dateFormat = 'yyyy-MM';
      }

      const { data, error } = await supabase
        .from('hub_members')
        .select('created_at')
        .eq('hub_id', hubId)
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      // Group by time period
      const groupedData: { [key: string]: number } = {};
      
      (data || []).forEach(member => {
        const date = new Date(member.created_at);
        const key = format(date, dateFormat);
        groupedData[key] = (groupedData[key] || 0) + 1;
      });

      // Convert to array format
      return Object.entries(groupedData).map(([key, count]) => ({
        month: key,
        year: parseInt(key.split('-')[0]),
        date: key,
        new_members: count
      }));
    }
  });

  const refreshMetrics = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Call the refresh function
      await supabase.rpc('refresh_hub_metrics', { _hub_id: hubId });
      
      // Invalidate queries to refresh data
      await Promise.all([
        // Add query invalidations here if needed
      ]);
    } catch (error) {
      console.error('Error refreshing metrics:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [hubId]);

  const formatDate = useCallback((dateStr: string, period: TimePeriod) => {
    const date = new Date(dateStr);
    switch (period) {
      case 'last_7_days':
      case 'last_30_days':
        return format(date, 'MMM dd');
      case 'last_90_days':
      case 'last_year':
      case 'month':
        return format(date, 'MMM yyyy');
      default:
        return format(date, 'MMM dd');
    }
  }, []);

  return {
    memberGrowth,
    storageMetrics,
    summary,
    timePeriod,
    setTimePeriod,
    isRefreshing,
    refreshMetrics,
    formatDate
  };
}
