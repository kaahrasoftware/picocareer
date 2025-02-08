
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import type { Session } from "@supabase/supabase-js";

export function useAuthSession() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: session, error: sessionError, isError } = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          // Handle session expiration error
          if (error.message?.includes('Invalid Refresh Token') || 
              error.message?.includes('session expired')) {
            console.error('Session expired:', error);
            
            // Clear auth data
            await supabase.auth.signOut();
            queryClient.clear();
            
            // Show toast notification
            toast({
              title: "Session Expired",
              description: "Your session has expired. Please sign in again.",
              variant: "destructive",
            });
            
            // Redirect to auth page
            navigate("/auth");
            return null;
          }
          throw error;
        }
        return session;
      } catch (error) {
        console.error('Auth session error:', error);
        throw error;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Set up auth state change listener
  supabase.auth.onAuthStateChange((event, newSession) => {
    if (event === 'SIGNED_IN') {
      queryClient.setQueryData(['auth-session'], newSession);
    } 
    else if (event === 'SIGNED_OUT') {
      queryClient.setQueryData(['auth-session'], null);
      queryClient.removeQueries({ queryKey: ['profile'] });
      queryClient.removeQueries({ queryKey: ['notifications'] });
    }
  });

  return {
    session,
    sessionError,
    isError,
    queryClient
  };
}
