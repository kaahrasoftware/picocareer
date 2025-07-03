
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useSessionStatusCounts() {
  return useQuery({
    queryKey: ['session-status-counts'],
    queryFn: async () => {
      // Get total sessions count
      const { count: totalCount } = await supabase
        .from('mentor_sessions')
        .select('*', { count: 'exact', head: true });

      // Get pending sessions count  
      const { count: pendingCount } = await supabase
        .from('mentor_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Get confirmed sessions count
      const { count: confirmedCount } = await supabase
        .from('mentor_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'confirmed');

      // Get completed sessions count
      const { count: completedCount } = await supabase
        .from('mentor_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      // Get cancelled sessions count
      const { count: cancelledCount } = await supabase
        .from('mentor_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'cancelled');

      return {
        total: totalCount || 0,
        pending: pendingCount || 0,
        confirmed: confirmedCount || 0,
        completed: completedCount || 0,
        cancelled: cancelledCount || 0
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
