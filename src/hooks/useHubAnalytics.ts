
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { HubStorageMetrics } from '@/types/database/analytics';
import { useState } from 'react';

export function useHubAnalytics(hubId: string) {
  const [timePeriod, setTimePeriod] = useState<'week' | 'month' | 'year'>('month');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const query = useQuery({
    queryKey: ['hub-analytics', hubId],
    queryFn: async (): Promise<{ storageMetrics: HubStorageMetrics | null }> => {
      const { data, error } = await supabase
        .from('hub_storage_metrics')
        .select('*')
        .eq('hub_id', hubId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      // Fix: Transform data to match HubStorageMetrics interface - use last_calculated_at as fallback for created_at
      const storageMetrics = data ? {
        ...data,
        created_at: data.last_calculated_at || new Date().toISOString() // Use last_calculated_at as fallback
      } as HubStorageMetrics : null;

      return { storageMetrics };
    },
    enabled: !!hubId
  });

  const refreshMetrics = async () => {
    setIsRefreshing(true);
    await query.refetch();
    setIsRefreshing(false);
  };

  const formatDate = (date: string, period: string) => {
    const d = new Date(date);
    return d.toLocaleDateString();
  };

  // Mock data for member growth - replace with actual query when available
  const memberGrowth = [
    { month: '2024-01', new_members: 5, total_members: 10 },
    { month: '2024-02', new_members: 8, total_members: 18 },
    { month: '2024-03', new_members: 12, total_members: 30 },
  ];

  const summary = {
    totalMembers: 30,
    activeMembers: 25,
    totalStorage: query.data?.storageMetrics?.total_storage_bytes || 0,
    totalResources: query.data?.storageMetrics?.resources_count || 0,
    memberLimit: 100,
    resourceCount: query.data?.storageMetrics?.resources_count || 0,
    announcementCount: query.data?.storageMetrics?.announcements_count || 0,
    totalAnnouncements: query.data?.storageMetrics?.announcements_count || 0,
    storageUsage: query.data?.storageMetrics?.total_storage_bytes || 0,
    storageLimit: 5368709120, // 5GB in bytes
  };

  return {
    ...query,
    memberGrowth,
    isRefreshing,
    storageMetrics: query.data?.storageMetrics,
    summary,
    timePeriod,
    setTimePeriod,
    refreshMetrics,
    formatDate,
  };
}
