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
  
  const authRetryCount = useRef(0);
  const MAX_AUTH_RETRIES = 3;

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const setupAuthListener = async () => {
      try {
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
        
        const { data } = supabase.auth.onAuthStateChange(
          async (event, currentSession) => {
            console.log('Auth state changed:', event);
            
            if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
              setSession(null);
              setUser(null);
            } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
              setSession(currentSession);
              setUser(currentSession?.user ?? null);
              authRetryCount.current = 0;
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

    return () => {
      if (authChangeSubscription.current) {
        authChangeSubscription.current.unsubscribe();
      }
    };
  }, [toast]);

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
