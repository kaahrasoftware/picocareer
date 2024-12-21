import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Session } from "@supabase/supabase-js";

export function useNotifications(session: Session | null) {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['notifications', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('profile_id', session.user.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching notifications:', error);
          throw error;
        }
        return data || [];
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        throw error;
      }
    },
    enabled: !!session?.user?.id,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchInterval: 30000,
    meta: {
      errorMessage: "Failed to load notifications. Please try again later."
    }
  });
}