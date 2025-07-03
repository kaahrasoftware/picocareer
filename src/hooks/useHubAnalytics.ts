
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { HubStorageMetrics } from '@/types/database/analytics';

export function useHubAnalytics(hubId: string) {
  return useQuery({
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
}
