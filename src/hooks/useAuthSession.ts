
import React, { useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

// Session protection levels
export type AuthProtectionLevel = 'required' | 'optional' | 'public';

export function useAuthSession(protectionLevel: AuthProtectionLevel = 'optional') {
  const { session, user, loading, error, signOut } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  // Handle route protection based on authentication state
  React.useEffect(() => {
    // Only process after loading is complete and not on every render
    if (loading) return;
    
    if (protectionLevel === 'required' && !session) {
      // Use navigate for routing within React Router
      navigate('/auth');
    }
  }, [session, loading, protectionLevel, navigate]);

  // Add session refresh helper
  const refreshSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Error refreshing session:', error);
        return false;
      }
      
      // Invalidate user data queries after session refresh
      if (data.session?.user?.id) {
        queryClient.invalidateQueries({ queryKey: ['profile', data.session.user.id] });
        queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      }
      
      return !!data.session;
    } catch (err) {
      console.error('Exception during session refresh:', err);
      return false;
    }
  }, [queryClient]);

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
