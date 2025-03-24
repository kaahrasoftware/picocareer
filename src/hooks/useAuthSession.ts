
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
    
    // Remove specific items from localStorage
    localStorage.removeItem('picocareer_auth_token');
    localStorage.removeItem('supabase.auth.token');
    
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
        console.log('Fetching auth session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          // Handle session expiration and invalid refresh token cases
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

        // If session exists but access token is expired
        if (session?.expires_at && session.expires_at * 1000 < Date.now()) {
          console.log('Session expired, handling expiration...');
          await handleSessionExpiration();
          return null;
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
  supabase.auth.onAuthStateChange(async (event, newSession) => {
    if (event === 'SIGNED_IN') {
      queryClient.setQueryData(['auth-session'], newSession);
    } 
    else if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
      queryClient.setQueryData(['auth-session'], null);
      queryClient.removeQueries({ queryKey: ['profile'] });
      queryClient.removeQueries({ queryKey: ['notifications'] });
      
      if (event === 'TOKEN_REFRESHED' && !newSession) {
        await handleSessionExpiration();
      }
    }
  });

  return {
    session,
    sessionError,
    isError,
    queryClient
  };
}
