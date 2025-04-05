
import { useAuth } from "@/context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Session protection levels
export type AuthProtectionLevel = 'required' | 'optional' | 'public';

export function useAuthSession(protectionLevel: AuthProtectionLevel = 'optional') {
  const { session, user, loading, error, signOut } = useAuth();
  const queryClient = useQueryClient();
  
  // Handle route protection based on authentication state
  React.useEffect(() => {
    // Only process after loading is complete and not on every render
    if (loading) return;
    
    if (protectionLevel === 'required' && !session) {
      // Instead of using useNavigate, we can use window.location for critical redirects
      // when we're not sure if we're in a router context
      window.location.href = '/auth';
    }
  }, [session, loading, protectionLevel]);

  // Add session refresh helper
  const refreshSession = React.useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Error refreshing session:', error);
        return false;
      }
      return !!data.session;
    } catch (err) {
      console.error('Exception during session refresh:', err);
      return false;
    }
  }, []);

  return {
    session,
    user,
    loading,
    error: error,
    isError: !!error,
    isLoading: loading,
    signOut,
    refreshSession,
    queryClient,
    isAuthenticated: !!session,
  };
}
