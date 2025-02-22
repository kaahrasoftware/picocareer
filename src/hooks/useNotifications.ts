
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";

export function useNotifications(session: Session | null) {
  const { toast } = useToast();
  const navigate = useNavigate();

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
          console.error('Supabase query error:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });

          // Handle auth errors specifically
          if (error.message.includes('JWT') || error.message.includes('session')) {
            toast({
              title: "Session expired",
              description: "Please sign in again",
              variant: "destructive",
            });
            navigate("/auth");
            return [];
          }

          throw error;
        }

        console.log('Notifications fetched successfully:', data?.length);
        return data || [];
      } catch (error: any) {
        console.error('Failed to fetch notifications:', error);
        
        toast({
          title: "Error loading notifications",
          description: "Please check your connection and try again",
          variant: "destructive",
        });
        
        throw error;
      }
    },
    enabled: !!session?.user?.id,
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 1000 * 60 * 5, // Keep data in cache for 5 minutes
    refetchInterval: 30000, // Only refetch every 30 seconds
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: true, // Fetch on mount
    retry: 3, // Retry failed requests 3 times
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    meta: {
      errorMessage: "Failed to load notifications. Please try again later."
    }
  });
}
