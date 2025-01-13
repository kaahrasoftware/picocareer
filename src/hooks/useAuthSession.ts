import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export function useAuthSession() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Get initial session and listen for auth changes
  const { data: session, isError } = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      try {
        // First try to get the existing session
        const { data: { session: existingSession }, error: sessionError } = 
          await supabase.auth.getSession();
        
        if (sessionError) {
          // Check specifically for refresh token errors
          if (sessionError.message?.includes('Invalid Refresh Token') || 
              sessionError.message?.includes('session_expired')) {
            console.log('Session expired, clearing data...');
            // Clear all auth-related data
            await supabase.auth.signOut();
            localStorage.removeItem('picocareer_auth_token');
            queryClient.removeQueries({ queryKey: ['auth-session'] });
            queryClient.removeQueries({ queryKey: ['profile'] });
            queryClient.removeQueries({ queryKey: ['notifications'] });
            
            // Show a friendly message to the user
            toast({
              title: "Session Expired",
              description: "Your session has expired. Please sign in again.",
              variant: "default",
            });
            
            // Redirect to auth page
            navigate("/auth");
            return null;
          }
          throw sessionError;
        }

        if (!existingSession) {
          // If no session exists, clear any stale data
          queryClient.removeQueries({ queryKey: ['auth-session'] });
          queryClient.removeQueries({ queryKey: ['profile'] });
          queryClient.removeQueries({ queryKey: ['notifications'] });
          localStorage.removeItem('picocareer_auth_token');
          return null;
        }

        // Set up a listener for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
              queryClient.removeQueries({ queryKey: ['auth-session'] });
              queryClient.removeQueries({ queryKey: ['profile'] });
              queryClient.removeQueries({ queryKey: ['notifications'] });
              localStorage.removeItem('picocareer_auth_token');
            } else if (event === 'TOKEN_REFRESHED') {
              queryClient.invalidateQueries({ queryKey: ['auth-session'] });
            }
          }
        );

        return existingSession;
      } catch (error: any) {
        console.error('Error in useAuthSession:', error);
        
        // Clear any stale session data
        await supabase.auth.signOut();
        queryClient.clear();
        
        // Only show toast and redirect if it's not an AuthSessionMissingError
        if (error.message !== 'Auth session missing!') {
          toast({
            title: "Authentication Error",
            description: "Please sign in again",
            variant: "destructive",
          });
          
          navigate("/auth");
        }
        
        return null;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // Consider session data fresh for 5 minutes
  });

  return { session, isError };
}