import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useAuthSession() {
  const queryClient = useQueryClient();

  const { data: session, error: sessionError } = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      try {
        const { data: { session: existingSession }, error: sessionError } = 
          await supabase.auth.getSession();
        
        if (sessionError) {
          // Check specifically for session errors
          if (sessionError.message?.includes('session_not_found') || 
              sessionError.message?.includes('Invalid JWT') ||
              sessionError.message?.includes('JWT expired')) {
            console.log('Session invalid or expired, clearing data...');
            await supabase.auth.signOut();
            localStorage.removeItem('picocareer_auth_token');
            queryClient.removeQueries({ queryKey: ['auth-session'] });
            queryClient.removeQueries({ queryKey: ['profile'] });
            queryClient.removeQueries({ queryKey: ['notifications'] });
          }
          throw sessionError;
        }

        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state changed:', event);
            
            if (event === 'SIGNED_OUT') {
              queryClient.removeQueries({ queryKey: ['auth-session'] });
              queryClient.removeQueries({ queryKey: ['profile'] });
              queryClient.removeQueries({ queryKey: ['notifications'] });
              localStorage.removeItem('picocareer_auth_token');
            } else if (event === 'TOKEN_REFRESHED') {
              console.log('Token refreshed successfully');
              queryClient.invalidateQueries({ queryKey: ['auth-session'] });
            }
          }
        );

        // Store the session token
        if (existingSession?.access_token) {
          localStorage.setItem('picocareer_auth_token', existingSession.access_token);
        }

        return existingSession;
      } catch (error: any) {
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