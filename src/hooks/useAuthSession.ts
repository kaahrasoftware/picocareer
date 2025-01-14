import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export function useAuthSession() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: session, isError } = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      try {
        // First try to get the existing session
        const { data: { session: existingSession }, error: sessionError } = 
          await supabase.auth.getSession();
        
        if (sessionError) {
          // Check specifically for session expiration errors
          if (sessionError.message?.includes('Invalid Refresh Token') || 
              sessionError.message?.includes('session_expired')) {
            console.log('Session expired, clearing data...');
            await handleSessionExpiration();
            return null;
          }
          throw sessionError;
        }

        if (!existingSession) {
          console.log('No valid session found');
          clearSessionData();
          return null;
        }

        // Set up a listener for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
              clearSessionData();
            } else if (event === 'TOKEN_REFRESHED') {
              queryClient.invalidateQueries({ queryKey: ['auth-session'] });
            } else if (event === 'SIGNED_IN') {
              // Refresh queries when user signs in
              await queryClient.invalidateQueries();
            }
          }
        );

        return existingSession;
      } catch (error: any) {
        console.error('Error in useAuthSession:', error);
        
        if (error.message?.includes('Invalid Refresh Token') || 
            error.message?.includes('session_expired')) {
          await handleSessionExpiration();
          return null;
        }
        
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
    refetchInterval: 1000 * 60 * 4, // Refetch every 4 minutes to prevent expiration
  });

  const clearSessionData = () => {
    queryClient.removeQueries({ queryKey: ['auth-session'] });
    queryClient.removeQueries({ queryKey: ['profile'] });
    queryClient.removeQueries({ queryKey: ['notifications'] });
    localStorage.removeItem('picocareer_auth_token');
  };

  const handleSessionExpiration = async () => {
    await supabase.auth.signOut();
    clearSessionData();
    
    toast({
      title: "Session Expired",
      description: "Your session has expired. Please sign in again.",
      variant: "default",
    });
    
    navigate("/auth");
  };

  return { session, isError };
}