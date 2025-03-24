
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, throttledAuthOperation } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: Error | null;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  const isInitialized = useRef(false);
  const authChangeSubscription = useRef<{ unsubscribe: () => void } | null>(null);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    // Set up the auth state listener first to catch changes in real time
    const setupAuthListener = async () => {
      try {
        // First, check for an existing session to avoid an initial flicker
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting initial session:', sessionError);
          setError(sessionError);
        } else if (sessionData?.session) {
          console.log('Initial session found');
          setSession(sessionData.session);
          setUser(sessionData.session.user);
        }
        
        // Now set up real-time auth state change listener
        const { data } = supabase.auth.onAuthStateChange(
          async (event, currentSession) => {
            console.log('Auth state changed:', event);
            
            if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
              setSession(null);
              setUser(null);
            } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
              setSession(currentSession);
              setUser(currentSession?.user ?? null);
            }
          }
        );

        authChangeSubscription.current = data.subscription;
      } catch (err) {
        console.error('Unexpected error during auth setup:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    setupAuthListener();

    // Cleanup the subscription when component unmounts
    return () => {
      if (authChangeSubscription.current) {
        authChangeSubscription.current.unsubscribe();
      }
    };
  }, []);

  // Implement a throttled sign out function to prevent race conditions
  const signOut = async () => {
    try {
      // Use throttled operation to prevent rate limiting
      await throttledAuthOperation(async () => {
        const { error } = await supabase.auth.signOut({
          scope: 'local' // Only sign out from this device, not globally
        });
        
        if (error) throw error;
        
        toast({
          title: "Signed out successfully",
          description: "You have been signed out of your account."
        });
      });
      
      // Force a clear of the session in our state
      setSession(null);
      setUser(null);
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast({
        title: "Error signing out",
        description: error.message || "An error occurred while signing out",
        variant: "destructive",
      });
    }
  };

  // Create the context value with all auth state
  const value = {
    session,
    user,
    loading,
    error,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
