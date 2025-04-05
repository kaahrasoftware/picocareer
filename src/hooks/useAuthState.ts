
import { useState, useRef, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, throttledAuthOperation } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Primary hook to manage authentication state
 * Returns session, user, loading state, and sign out function
 */
export function useAuthState() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isInitialized = useRef(false);
  const authChangeSubscription = useRef<{ unsubscribe: () => void } | null>(null);
  const authRetryCount = useRef(0);
  const MAX_AUTH_RETRIES = 3;

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const setupAuthListener = async () => {
      try {
        // First set up auth state change listener
        const { data } = supabase.auth.onAuthStateChange(
          async (event, currentSession) => {
            console.log('Auth state changed:', event);
            
            if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
              setSession(null);
              setUser(null);
              // Clear queries when user signs out
              queryClient.clear();
            } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
              // Set session state immediately to update UI
              setSession(currentSession);
              setUser(currentSession?.user ?? null);
              authRetryCount.current = 0;
              
              // Invalidate queries to refresh data after sign in
              if (currentSession?.user?.id) {
                queryClient.invalidateQueries({ queryKey: ['profile', currentSession.user.id] });
                queryClient.invalidateQueries({ queryKey: ['notifications', currentSession.user.id] });
                queryClient.invalidateQueries({ queryKey: ['user-profile'] });
              }
            }
          }
        );

        authChangeSubscription.current = data.subscription;

        // Then check for existing session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting initial session:', sessionError);
          setError(sessionError);
          
          if (!sessionError.message.includes('Refresh Token Not Found')) {
            toast({
              title: "Authentication error",
              description: "There was a problem with your session. Please try signing in again.",
              variant: "destructive",
            });
          }
        } else if (sessionData?.session) {
          console.log('Initial session found');
          setSession(sessionData.session);
          setUser(sessionData.session.user);
        }
      } catch (err) {
        console.error('Unexpected error during auth setup:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    setupAuthListener();

    return () => {
      if (authChangeSubscription.current) {
        authChangeSubscription.current.unsubscribe();
      }
    };
  }, [toast, queryClient]);

  const signOut = async () => {
    try {
      await throttledAuthOperation(async () => {
        const { error } = await supabase.auth.signOut({
          scope: 'local'
        });
        
        if (error) throw error;
        
        toast({
          title: "Signed out successfully",
          description: "You have been signed out of your account."
        });
      });
      
      // Clear session state
      setSession(null);
      setUser(null);
      
      // Clear query cache to prevent stale data from previous session
      queryClient.clear();
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast({
        title: "Error signing out",
        description: error.message || "An error occurred while signing out",
        variant: "destructive",
      });
    }
  };

  return {
    session,
    user,
    loading,
    error,
    signOut,
  };
}
