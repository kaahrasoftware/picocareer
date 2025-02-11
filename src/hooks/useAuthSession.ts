
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import type { Session } from "@supabase/supabase-js";

export function useAuthSession() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSessionExpiration = async () => {
    console.log('Handling session expiration...');
    
    // First, clear Supabase auth state
    await supabase.auth.signOut();
    
    // Clear all queries from cache
    queryClient.clear();
    
    // Clear auth token from localStorage
    const key = `sb-${process.env.VITE_SUPABASE_PROJECT_ID}-auth-token`;
    localStorage.removeItem(key);
    
    // Show user-friendly notification
    toast({
      title: "Session Expired",
      description: "Your session has expired. Please sign in again.",
      variant: "destructive",
    });
    
    // Redirect to auth page
    navigate("/auth");
  };

  const { data: session, error: sessionError, isError } = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          // Handle both session expiration and invalid refresh token cases
          if (error.message?.includes('Invalid Refresh Token') || 
              error.message?.includes('session expired') ||
              error.message?.includes('not authenticated') ||
              error.status === 400) {
            console.error('Session error:', error);
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

  // Set up auth state change listener
  supabase.auth.onAuthStateChange((event, newSession) => {
    if (event === 'SIGNED_IN') {
      queryClient.setQueryData(['auth-session'], newSession);
    } 
    else if (event === 'SIGNED_OUT') {
      queryClient.setQueryData(['auth-session'], null);
      queryClient.removeQueries({ queryKey: ['profile'] });
      queryClient.removeQueries({ queryKey: ['notifications'] });
      
      // Clear localStorage
      const key = `sb-${process.env.VITE_SUPABASE_PROJECT_ID}-auth-token`;
      localStorage.removeItem(key);
    }
  });

  return {
    session,
    sessionError,
    isError,
    queryClient
  };
}
