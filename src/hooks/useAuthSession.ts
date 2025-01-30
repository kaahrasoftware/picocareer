import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { useToast } from "./use-toast";

export function useAuthSession() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSessionExpiration = () => {
    // Clear all queries from cache
    queryClient.clear();
    
    // Show toast notification
    toast({
      title: "Session Expired",
      description: "Your session has expired. Please sign in again.",
      variant: "destructive",
    });

    // Navigate to auth page
    navigate("/auth");
  };

  const { data: session, error: sessionError, isError } = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      try {
        console.log('Fetching auth session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          // Handle session expiration and invalid refresh token errors
          if (error.message?.includes('Invalid Refresh Token') || 
              error.message?.includes('session_expired')) {
            await handleSessionExpiration();
          }
          throw error;
        }
        
        if (!session) {
          console.log('No valid session found');
          return null;
        }
        
        console.log('Valid session found');
        return session;
      } catch (error: any) {
        console.error('Detailed session error:', error);
        throw error;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 10, // Keep data in cache for 10 minutes
  });

  // Set up auth state change listener
  supabase.auth.onAuthStateChange(async (event, newSession) => {
    if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
      queryClient.invalidateQueries({ queryKey: ['auth-session'] });
    }

    // Handle session expiration
    if (event === 'TOKEN_REFRESHED' && !newSession) {
      handleSessionExpiration();
    }
  });

  return { session, sessionError, isError, queryClient };
}