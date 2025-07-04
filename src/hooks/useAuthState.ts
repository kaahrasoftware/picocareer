
import React, { useState, useRef, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useLoginReward } from './useLoginReward';

export function useAuthState() {
  const [session, setSession] = React.useState<Session | null>(null);
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);
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
        // Set up auth state change listener
        const { data } = supabase.auth.onAuthStateChange(
          (event, currentSession) => {
            console.log('Auth state changed:', event);
            
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
            
            if (event === 'SIGNED_IN' && currentSession?.user?.id) {
              console.log('User signed in:', currentSession.user.id);
              
              // Invalidate queries to refresh data
              setTimeout(() => {
                queryClient.invalidateQueries({ queryKey: ['profile', currentSession.user.id] });
                queryClient.invalidateQueries({ queryKey: ['notifications', currentSession.user.id] });
                queryClient.invalidateQueries({ queryKey: ['user-profile'] });
              }, 100);

              // Process daily login reward
              setTimeout(() => {
                processLoginReward(currentSession.user.id);
              }, 1000);
            } else if (event === 'SIGNED_OUT') {
              console.log('User signed out');
              queryClient.clear();
            }
          }
        );

        authChangeSubscription.current = data.subscription;

        // Check for existing session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting initial session:', sessionError);
          setError(sessionError);
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
  }, [toast, queryClient, processLoginReward]);

  const signOut = async () => {
    try {
      console.log('Signing out...');
      setLoading(true);
      
      const { error } = await supabase.auth.signOut({
        scope: 'local'
      });
      
      if (error) throw error;
      
      // Clear states immediately
      setSession(null);
      setUser(null);
      
      // Clear query cache
      queryClient.clear();
      
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account."
      });

      // Redirect to auth page
      setTimeout(() => {
        window.location.href = '/auth';
      }, 500);
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
