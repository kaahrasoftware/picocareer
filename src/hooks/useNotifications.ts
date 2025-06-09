
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
        
        // First check if the session is still valid
        const { data: sessionCheck, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !sessionCheck?.session) {
          console.log('Session invalid, clearing and redirecting to auth');
          toast({
            title: "Session expired",
            description: "Please sign in again",
            variant: "destructive",
          });
          navigate("/auth");
          return [];
        }
        
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('profile_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(50); // Limit initial load for better performance
        
        if (error) {
          console.error('Supabase query error:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });

          // Handle specific auth errors
          if (error.message.includes('JWT') || error.message.includes('session') || error.message.includes('token')) {
            toast({
              title: "Session expired",
              description: "Please sign in again",
              variant: "destructive",
            });
            navigate("/auth");
            return [];
          }

          // Handle RLS policy errors
          if (error.message.includes('policy') || error.message.includes('RLS')) {
            console.log('RLS policy issue detected, user may not have proper access');
            return [];
          }

          throw error;
        }

        console.log('Notifications fetched successfully:', data?.length || 0);
        return data || [];
      } catch (error: any) {
        console.error('Failed to fetch notifications:', error);
        
        // Don't show toast for authentication-related errors (already handled above)
        if (!error?.message?.includes('JWT') && !error?.message?.includes('session')) {
          toast({
            title: "Unable to load notifications",
            description: "There was a problem loading your notifications. Please try refreshing the page.",
            variant: "destructive",
          });
        }
        
        // Return empty array instead of throwing to prevent app crashes
        return [];
      }
    },
    enabled: !!session?.user?.id,
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 1000 * 60 * 5, // Keep data in cache for 5 minutes
    refetchInterval: 60000, // Refetch every minute instead of 30 seconds
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: true, // Fetch on mount
    retry: (failureCount, error: any) => {
      // Don't retry on auth errors
      if (error?.message?.includes('JWT') || error?.message?.includes('session')) {
        return false;
      }
      // Only retry 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000), // Cap at 10 seconds
    meta: {
      errorMessage: "Failed to load notifications. Please try again later."
    }
  });
}
