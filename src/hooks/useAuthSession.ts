import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

export function useAuthSession() {
  const queryClient = useQueryClient();

  const { data: session, error: sessionError } = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      try {
        const { data: { session: existingSession }, error } = 
          await supabase.auth.getSession();

        if (error) {
          console.error('Session error:', error);
          throw error;
        }

        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            console.log('Auth state changed:', event);
            
            if (event === 'SIGNED_OUT') {
              console.log('User signed out, cleaning up...');
              localStorage.removeItem('picocareer_auth_token');
              queryClient.removeQueries({ queryKey: ['auth-session'] });
              queryClient.removeQueries({ queryKey: ['profile'] });
              queryClient.removeQueries({ queryKey: ['notifications'] });
            } 
            else if (event === 'TOKEN_REFRESHED') {
              console.log('Token refreshed, updating session...');
              queryClient.invalidateQueries({ queryKey: ['auth-session'] });
            }
            else if (event === 'SIGNED_IN') {
              console.log('User signed in, updating session...');
              if (newSession?.access_token) {
                localStorage.setItem('picocareer_auth_token', newSession.access_token);
              }
              queryClient.invalidateQueries({ queryKey: ['auth-session'] });
            }
          }
        );

        // Store the session token if it exists
        if (existingSession?.access_token) {
          localStorage.setItem('picocareer_auth_token', existingSession.access_token);
        }

        return existingSession;
      } catch (error) {
        console.error('Error in useAuthSession:', error);
        throw error;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    session,
    sessionError,
    queryClient
  };
}