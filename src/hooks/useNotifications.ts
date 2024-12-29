import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Session } from "@supabase/supabase-js";

export function useNotifications(session: Session | null) {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['notifications', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) {
        console.log('No authenticated session, skipping notifications fetch');
        return [];
      }
      
      try {
        console.log('Fetching notifications for user:', session.user.id);
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('profile_id', session.user.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Supabase query error:', error);
          throw error;
        }

        console.log('Notifications fetched successfully:', data?.length);
        return data || [];
      } catch (error: any) {
        console.error('Failed to fetch notifications:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        // Only show error toast on final retry
        if (!error.message?.includes('Failed to fetch')) {
          toast({
            title: "Error loading notifications",
            description: "Please check your connection and try again",
            variant: "destructive",
          });
        }
        
        throw error;
      }
    },
    enabled: !!session?.user?.id,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff with max 30s
    refetchInterval: 30000, // Refetch every 30 seconds
    meta: {
      errorMessage: "Failed to load notifications. Please try again later."
    }
  });
}