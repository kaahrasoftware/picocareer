
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import type { Session } from "@supabase/supabase-js";
import { useEffect } from "react";

export function useAuthSession() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Handle session expiration and sign out process
  const handleSessionExpiration = async () => {
    try {
      console.log('Handling session expiration...');
      
      // First, clear Supabase auth state
      await supabase.auth.signOut();
      
      // Clear all queries from cache
      queryClient.clear();
      
      // Don't remove tokens manually - let Supabase handle it
      
      // Show user-friendly notification
      toast({
        title: "Session Expired",
        description: "Your session has expired. Please sign in again.",
        variant: "destructive",
      });
      
      // Redirect to auth page
      navigate("/auth");
    } catch (error) {
      console.error('Error handling session expiration:', error);
    }
  };

  // Set up auth state change listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_IN') {
          queryClient.setQueryData(['auth-session'], newSession);
        } 
        else if (event === 'SIGNED_OUT') {
          queryClient.setQueryData(['auth-session'], null);
          queryClient.removeQueries({ queryKey: ['profile'] });
          queryClient.removeQueries({ queryKey: ['notifications'] });
        }
        else if (event === 'TOKEN_REFRESHED') {
          if (newSession) {
            queryClient.setQueryData(['auth-session'], newSession);
          } else {
            await handleSessionExpiration();
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, queryClient, toast]);

  // Get the current session
  const { data: session, error: sessionError, isError } = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      try {
        console.log('Fetching auth session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          if (error.message?.includes('Invalid refresh token') || 
              error.message?.includes('expired')) {
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
        console.error('Auth session error:', error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 10, // Keep data in cache for 10 minutes
  });

  return {
    session,
    sessionError,
    isError,
    queryClient
  };
}
