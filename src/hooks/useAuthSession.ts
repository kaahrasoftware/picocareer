
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import type { Session } from "@supabase/supabase-js";

export function useAuthSession() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: session, error: sessionError, isError } = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          // Handle session expiration error
          if (error.message?.includes('Invalid Refresh Token') || 
              error.message?.includes('session expired') ||
              error.message?.includes('JWT expired')) {
            console.error('Session expired:', error);
            
            // Clear auth state
            await handleSessionExpiration();
            return null;
          }
          throw error;
        }
        return session;
      } catch (error) {
        console.error('Auth session error:', error);
        throw error;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Handle session expiration
  const handleSessionExpiration = async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear any auth-related data from localStorage
      const key = `sb-${process.env.VITE_SUPABASE_PROJECT_ID}-auth-token`;
      localStorage.removeItem(key);
      
      // Clear all queries from cache
      queryClient.clear();
      
      // Show toast notification
      toast({
        title: "Session Expired",
        description: "Your session has expired. Please sign in again.",
        variant: "destructive",
      });
      
      // Redirect to auth page
      navigate("/auth");
    } catch (error) {
      console.error('Error handling session expiration:', error);
    }
  };

  // Set up auth state change listener
  supabase.auth.onAuthStateChange((event, newSession) => {
    if (event === 'SIGNED_IN') {
      queryClient.setQueryData(['auth-session'], newSession);
    } 
    else if (event === 'SIGNED_OUT') {
      queryClient.setQueryData(['auth-session'], null);
      queryClient.removeQueries({ queryKey: ['profile'] });
      queryClient.removeQueries({ queryKey: ['notifications'] });
    }
    // Handle token refresh error
    else if (event === 'TOKEN_REFRESHED' && !newSession) {
      handleSessionExpiration();
    }
  });

  return {
    session,
    sessionError,
    isError,
    queryClient
  };
}
