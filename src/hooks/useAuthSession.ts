import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

export function useAuthSession() {
  const queryClient = useQueryClient();

  const { data: session, error: sessionError } = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      try {
        const { data: { session: existingSession }, error: sessionError } = 
          await supabase.auth.getSession();

        if (sessionError) {
          console.error('Session error:', sessionError);
          throw sessionError;
        }

        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state changed:', event);
            
            // Handle session cleanup events
            if (event === 'SIGNED_OUT' || 
                sessionError?.message?.includes('session_not_found') || 
                sessionError?.message?.includes('Invalid JWT') || 
                sessionError?.message?.includes('JWT expired')) {
              console.log('Clearing session data...');
              localStorage.removeItem('picocareer_auth_token');
              queryClient.removeQueries({ queryKey: ['auth-session'] });
              queryClient.removeQueries({ queryKey: ['profile'] });
              queryClient.removeQueries({ queryKey: ['notifications'] });
              
              // Only sign out if not already signed out
              if (event !== 'SIGNED_OUT') {
                await supabase.auth.signOut();
              }
            } else if (event === 'TOKEN_REFRESHED') {
              console.log('Token refreshed successfully');
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