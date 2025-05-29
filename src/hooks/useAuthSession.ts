
import React, { useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Session protection levels
export type AuthProtectionLevel = 'required' | 'optional' | 'public';

export function useAuthSession(protectionLevel: AuthProtectionLevel = 'optional') {
  const { session, user, loading, error, signOut } = useAuth();
  let queryClient;
  
  try {
    // Use try-catch to handle case where hook is called outside QueryClientProvider
    queryClient = useQueryClient();
  } catch (e) {
    console.warn('useQueryClient called outside QueryClientProvider, some features may not work properly');
  }
  
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
      console.log('Attempting to refresh auth session');
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Error refreshing session:', error);
        
        // Try getting the current session as a fallback
        const { data: currentSession, error: currentError } = await supabase.auth.getSession();
        if (currentError) {
          console.error('Error getting current session:', currentError);
          toast.error('Authentication error. Please try logging in again.');
          return false;
        }
        
        if (currentSession?.session) {
          console.log('Current session is still valid');
          return true;
        }
        
        return false;
      }
      
      console.log('Session refreshed successfully');
      
      // Invalidate user data queries after session refresh
      if (data.session?.user?.id && queryClient) {
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
