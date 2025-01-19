import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

export function useProfileSession() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: session, isError: sessionError } = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      try {
        console.log('Fetching auth session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          if (error.message?.includes('Invalid Refresh Token') || 
              error.message?.includes('session_expired')) {
            // Clear auth data
            const key = `sb-${process.env.VITE_SUPABASE_PROJECT_ID}-auth-token`;
            localStorage.removeItem(key);
            await supabase.auth.signOut();
            queryClient.clear();
            
            toast({
              title: "Session Expired",
              description: "Your session has expired. Please sign in again.",
              variant: "destructive",
            });
            
            navigate("/auth");
          }
          throw error;
        }
        
        if (!session) {
          console.log('No valid session found');
          return null;
        }
        
        console.log('Valid session found');
        return session;
      } catch (error: any) {
        console.error('Detailed session error:', error);
        throw error;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });

  // Set up auth state change listener
  supabase.auth.onAuthStateChange((event, newSession) => {
    if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
      queryClient.invalidateQueries({ queryKey: ['auth-session'] });
    }
  });

  return { session, sessionError, queryClient };
}