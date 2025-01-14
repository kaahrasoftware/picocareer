import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

export function useAuthSession() {
  const queryClient = useQueryClient();

  const { data: session, error: sessionError } = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Initial session error:', error);
          throw error;
        }

        // Store the session token if it exists
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
    initialData: () => {
      // Check for existing session in localStorage
      const token = localStorage.getItem('picocareer_auth_token');
      return token ? {} as Session : null;
    },
  });

  // Set up auth state change listener
  supabase.auth.onAuthStateChange((event, newSession) => {
    console.log('Auth state changed:', event);
    
    switch (event) {
      case 'SIGNED_IN':
        if (newSession?.access_token) {
          localStorage.setItem('picocareer_auth_token', newSession.access_token);
          queryClient.setQueryData(['auth-session'], newSession);
        }
        break;
        
      case 'SIGNED_OUT':
        localStorage.removeItem('picocareer_auth_token');
        queryClient.setQueryData(['auth-session'], null);
        queryClient.removeQueries({ queryKey: ['profile'] });
        queryClient.removeQueries({ queryKey: ['notifications'] });
        break;
        
      case 'TOKEN_REFRESHED':
        if (newSession?.access_token) {
          localStorage.setItem('picocareer_auth_token', newSession.access_token);
          queryClient.setQueryData(['auth-session'], newSession);
        }
        break;
    }
  });

  return {
    session,
    sessionError,
    queryClient
  };
}