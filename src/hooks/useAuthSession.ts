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
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Session error:', error);
          throw error;
        }
        return session;
      } catch (error: any) {
        console.error('Error fetching session:', error);
        toast({
          title: "Authentication Error",
          description: "Please try signing in again",
          variant: "destructive",
        });
        return null;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // Consider session data fresh for 5 minutes
  });

  // Set up auth state listener
  useQuery({
    queryKey: ['auth-listener'],
    queryFn: async () => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth event:', event);
        
        if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
          queryClient.removeQueries({ queryKey: ['auth-session'] });
          queryClient.removeQueries({ queryKey: ['profile'] });
          queryClient.removeQueries({ queryKey: ['notifications'] });
          // Clear any auth-related local storage
          localStorage.removeItem('picocareer_auth_token');
          navigate("/auth");
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log('Setting new session data');
          queryClient.setQueryData(['auth-session'], session);
        }
      });

      return subscription;
    },
    staleTime: Infinity,
  });

  return { session, isError };
}