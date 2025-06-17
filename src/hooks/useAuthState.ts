
import { useState, useRef, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
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
  const { processLoginReward } = useLoginReward();

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const setupAuthListener = async () => {
      try {
        console.log('Setting up auth listener...');
        
        // First set up auth state change listener
        const { data } = supabase.auth.onAuthStateChange(
          async (event, currentSession) => {
            console.log('Auth state changed:', event, currentSession?.user?.id);
            
            if (event === 'SIGNED_OUT') {
              console.log('User signed out, clearing state');
              setSession(null);
              setUser(null);
              setError(null);
              // Clear queries when user signs out
              queryClient.clear();
            } else if (event === 'SIGNED_IN') {
              console.log('User signed in, updating state and processing rewards');
              // Set session state immediately to update UI
              setSession(currentSession);
              setUser(currentSession?.user ?? null);
              setError(null);
              
              // Check if user is coming from auth page and redirect to home with refresh
              if (window.location.pathname === '/auth') {
                console.log('User signed in from auth page, redirecting to home with page refresh');
                // Use setTimeout to ensure state updates complete first
                setTimeout(() => {
                  window.location.href = '/';
                }, 100);
              }
              
              // Process queries and rewards after state update
              if (currentSession?.user?.id) {
                // Use setTimeout to ensure state updates complete first
                setTimeout(() => {
                  console.log('Invalidating queries after sign in');
                  queryClient.invalidateQueries({ queryKey: ['profile', currentSession.user.id] });
                  queryClient.invalidateQueries({ queryKey: ['notifications', currentSession.user.id] });
                  queryClient.invalidateQueries({ queryKey: ['user-profile'] });
                  queryClient.invalidateQueries({ queryKey: ['wallet', currentSession.user.id] });
                }, 200);

                // Process daily login reward
                setTimeout(() => {
                  processLoginReward(currentSession.user.id);
                }, 1000);
              }
            } else if (event === 'TOKEN_REFRESHED') {
              console.log('Token refreshed, updating session');
              setSession(currentSession);
              setUser(currentSession?.user ?? null);
              setError(null);
            }
            
            // Mark as not loading after any auth event
            setLoading(false);
          }
        );

        authChangeSubscription.current = data.subscription;

        // Then check for existing session
        console.log('Checking for existing session...');
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
          console.log('Initial session found, setting state');
          setSession(sessionData.session);
          setUser(sessionData.session.user);
          setError(null);
        } else {
          console.log('No initial session found');
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
      
      const { error } = await supabase.auth.signOut({
        scope: 'local'
      });
      
      if (error) throw error;
      
      // State will be cleared by the auth state change listener
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account."
      });

      // Redirect to auth page after successful logout
      window.location.href = '/auth';
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
