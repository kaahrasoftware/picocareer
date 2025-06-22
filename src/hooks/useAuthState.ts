
import { useState, useRef, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, throttledAuthOperation } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useLoginReward } from './useLoginReward';

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
  const hasRedirectedAfterLogin = useRef(false);
  const MAX_AUTH_RETRIES = 3;
  const { processLoginReward } = useLoginReward();

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const setupAuthListener = async () => {
      try {
        // First set up auth state change listener
        const { data } = supabase.auth.onAuthStateChange(
          (event, currentSession) => {
            console.log('Auth state changed:', event);
            
            if (event === 'SIGNED_OUT') {
              setSession(null);
              setUser(null);
              // Clear queries when user signs out
              queryClient.clear();
              authRetryCount.current = 0;
              hasRedirectedAfterLogin.current = false;
              
              // Redirect to auth page after sign out
              setTimeout(() => {
                window.location.href = '/auth';
              }, 100);
            } else if (event === 'SIGNED_IN') {
              // Set session state immediately to update UI
              setSession(currentSession);
              setUser(currentSession?.user ?? null);
              authRetryCount.current = 0;
              
              // Invalidate queries to refresh data after sign in
              if (currentSession?.user?.id) {
                // Use setTimeout to avoid potential auth deadlocks
                setTimeout(() => {
                  queryClient.invalidateQueries({ queryKey: ['profile', currentSession.user.id] });
                  queryClient.invalidateQueries({ queryKey: ['notifications', currentSession.user.id] });
                  queryClient.invalidateQueries({ queryKey: ['user-profile'] });
                }, 0);

                // Process daily login reward
                setTimeout(() => {
                  processLoginReward(currentSession.user.id);
                }, 1000);

                // Only redirect if this is a fresh login and we haven't already redirected
                if (!hasRedirectedAfterLogin.current && window.location.pathname === '/auth') {
                  console.log('Fresh login detected, redirecting to home page');
                  hasRedirectedAfterLogin.current = true;
                  setTimeout(() => {
                    window.location.href = '/';
                  }, 500); // Small delay to ensure state is updated
                }
              }
            } else if (event === 'TOKEN_REFRESHED') {
              // Set session state for token refresh but don't redirect
              setSession(currentSession);
              setUser(currentSession?.user ?? null);
              authRetryCount.current = 0;
              
              // Invalidate queries for token refresh
              if (currentSession?.user?.id) {
                setTimeout(() => {
                  queryClient.invalidateQueries({ queryKey: ['profile', currentSession.user.id] });
                  queryClient.invalidateQueries({ queryKey: ['notifications', currentSession.user.id] });
                  queryClient.invalidateQueries({ queryKey: ['user-profile'] });
                }, 0);
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
          // Mark that we already have a session to prevent unnecessary redirects
          hasRedirectedAfterLogin.current = true;
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
  }, [toast, queryClient, processLoginReward]);

  const signOut = async () => {
    try {
      console.log('Signing out...');
      setLoading(true);
      
      // Use simpler direct call for sign out instead of throttled version
      const { error } = await supabase.auth.signOut({
        scope: 'local'
      });
      
      if (error) throw error;
      
      // Ensure we clear states immediately to update UI
      setSession(null);
      setUser(null);
      hasRedirectedAfterLogin.current = false;
      
      // Clear query cache to prevent stale data from previous session
      queryClient.clear();
      
      // Show success toast after state updates
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account."
      });
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast({
        title: "Error signing out",
        description: error.message || "An error occurred while signing out",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
