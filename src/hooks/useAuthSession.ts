import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

export function useAuthSession() {
  const queryClient = useQueryClient();

  // Set up auth state change listener outside of the query
  const { data: session, error: sessionError } = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          throw error;
        }

        if (session?.access_token) {
          localStorage.setItem('picocareer_auth_token', session.access_token);
        }

        return session;
      } catch (error) {
        console.error('Session error:', error);
        throw error;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Set up auth state change listener
  supabase.auth.onAuthStateChange((event, newSession) => {
    console.log('Auth state changed:', event, newSession);
    
    if (event === 'SIGNED_IN' && newSession?.access_token) {
      console.log('User signed in, updating session...');
      localStorage.setItem('picocareer_auth_token', newSession.access_token);
      queryClient.setQueryData(['auth-session'], newSession);
    } 
    else if (event === 'SIGNED_OUT') {
      console.log('User signed out, cleaning up...');
      localStorage.removeItem('picocareer_auth_token');
      queryClient.setQueryData(['auth-session'], null);
      queryClient.removeQueries({ queryKey: ['profile'] });
      queryClient.removeQueries({ queryKey: ['notifications'] });
    }
    else if (event === 'TOKEN_REFRESHED' && newSession?.access_token) {
      console.log('Token refreshed, updating session...');
      localStorage.setItem('picocareer_auth_token', newSession.access_token);
      queryClient.setQueryData(['auth-session'], newSession);
    }
  });

  return {
    session,
    sessionError,
    queryClient
  };
}