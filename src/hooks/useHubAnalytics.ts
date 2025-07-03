
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
      
      // Transform data to match HubStorageMetrics interface
      const storageMetrics = data ? {
        ...data,
        created_at: data.created_at || data.last_calculated_at || new Date().toISOString()
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
    { date: '2024-01-01', members: 10, active: 8 },
    { date: '2024-02-01', members: 15, active: 12 },
    { date: '2024-03-01', members: 22, active: 18 },
  ];

  const summary = {
    totalMembers: 22,
    activeMembers: 18,
    totalStorage: query.data?.storageMetrics?.total_storage_bytes || 0,
    totalResources: query.data?.storageMetrics?.resources_count || 0,
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
