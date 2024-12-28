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
        const { data: { session: existingSession }, error: sessionError } = 
          await supabase.auth.getSession();
        
        if (sessionError) {
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