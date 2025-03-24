
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// Session protection levels
export type AuthProtectionLevel = 'required' | 'optional' | 'public';

export function useAuthSession(protectionLevel: AuthProtectionLevel = 'optional') {
  const { session, user, loading, error: sessionError, signOut } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  // Handle route protection based on authentication state
  useEffect(() => {
    // Only process after loading is complete and not on every render
    if (loading) return;
    
    if (protectionLevel === 'required' && !session) {
      // Redirect to auth page for protected routes when not logged in
      navigate('/auth', { replace: true });
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
    sessionError,
    isError: !!sessionError,
    signOut,
    refreshSession,
    queryClient,
    isAuthenticated: !!session,
  };
}
