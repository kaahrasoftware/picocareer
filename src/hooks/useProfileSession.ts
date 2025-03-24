
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useProfileSession() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: session, isError: sessionError } = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      try {
        console.log('Fetching auth session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          // Handle session expiration and invalid refresh token errors
          if (error.message?.includes('Invalid Refresh Token') || 
              error.message?.includes('session_expired')) {
            await handleSessionExpiration();
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
    gcTime: 1000 * 60 * 10, // Keep data in cache for 10 minutes
  });

  // Handle session expiration
  const handleSessionExpiration = async () => {
    console.log('Handling session expiration...');
    
    // Clear auth data from localStorage
    const key = `sb-${process.env.VITE_SUPABASE_PROJECT_ID}-auth-token`;
    localStorage.removeItem(key);
    
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    // Clear all queries from cache
    queryClient.clear();
    
    // Show toast notification
    toast({
      title: "Session Expired",
      description: "Your session has expired. Please sign in again.",
      variant: "destructive",
    });
    
    // Redirect to auth page using window.location instead of useNavigate
    window.location.href = "/auth";
  };

  // Set up auth state change listener
  supabase.auth.onAuthStateChange((event, newSession) => {
    if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
      queryClient.invalidateQueries({ queryKey: ['auth-session'] });
    }
  });

  return { session, sessionError, queryClient };
}
