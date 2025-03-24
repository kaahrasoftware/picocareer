
import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, throttledAuthOperation } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { SessionTimeoutDialog } from '@/components/auth/SessionTimeoutDialog';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: Error | null;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Session timeout configuration - increased to 30 minutes
const SESSION_TIMEOUT_WARNING_MS = 30 * 60 * 1000; // 30 minutes
const SESSION_ACTIVITY_EVENTS = ['click', 'keypress', 'scroll', 'mousemove', 'touchstart'];
// Reduced activity threshold to prevent excessive updates
const ACTIVITY_UPDATE_THRESHOLD_MS = 60 * 1000; // Only update activity timestamp max once per minute

export function AuthProvider({ children }: { children: React.ReactNode }) {
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
  
  // Session timeout management
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const timeoutWarningRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const lastActivityUpdateRef = useRef<number>(Date.now());

  // Track user activity with throttling to prevent excessive operations
  const updateLastActivity = useCallback(() => {
    const now = Date.now();
    
    // Only update if it's been more than the threshold since last update
    // This prevents excessive processing on rapid user interactions
    if (now - lastActivityUpdateRef.current < ACTIVITY_UPDATE_THRESHOLD_MS) {
      return;
    }
    
    lastActivityRef.current = now;
    lastActivityUpdateRef.current = now;
    
    // If there's a warning showing, hide it as user is active
    if (showTimeoutWarning) {
      setShowTimeoutWarning(false);
    }
    
    // Reset timeout warning timer
    if (timeoutWarningRef.current) {
      clearTimeout(timeoutWarningRef.current);
    }
    
    // Only set a new timeout if user is logged in
    if (session?.user) {
      timeoutWarningRef.current = setTimeout(() => {
        setShowTimeoutWarning(true);
      }, SESSION_TIMEOUT_WARNING_MS);
    }
  }, [showTimeoutWarning, session]);

  // Reset the session timeout when user continues session
  const handleContinueSession = useCallback(() => {
    setShowTimeoutWarning(false);
    updateLastActivity();
    
    // Proactively refresh the token when user continues session
    if (session) {
      throttledAuthOperation(async () => {
        try {
          const { data, error } = await supabase.auth.refreshSession();
          if (error) {
            console.error('Error refreshing session during continue:', error);
          } else if (data.session) {
            console.log('Session refreshed successfully during continue action');
          }
        } catch (err) {
          console.error('Exception during continue session refresh:', err);
        }
      });
    }
  }, [updateLastActivity, session]);

  // Handle user activity with passive event listeners
  useEffect(() => {
    if (!session?.user) return;
    
    const passiveEventHandler = () => {
      // Use requestAnimationFrame to debounce activity updates
      requestAnimationFrame(updateLastActivity);
    };
    
    // Setup activity listeners with passive option for better performance
    SESSION_ACTIVITY_EVENTS.forEach(event => {
      window.addEventListener(event, passiveEventHandler, { passive: true });
    });
    
    // Initial activity timestamp and warning timeout
    updateLastActivity();
    
    return () => {
      // Cleanup
      SESSION_ACTIVITY_EVENTS.forEach(event => {
        window.removeEventListener(event, passiveEventHandler);
      });
      
      if (timeoutWarningRef.current) {
        clearTimeout(timeoutWarningRef.current);
      }
    };
  }, [session, updateLastActivity]);

  // Setup periodic token refresh to prevent expiration
  useEffect(() => {
    if (!session?.user) return;
    
    // Refresh token every 10 minutes (or other suitable interval)
    const tokenRefreshInterval = setInterval(() => {
      throttledAuthOperation(async () => {
        try {
          const { data, error } = await supabase.auth.refreshSession();
          if (error) {
            console.error('Error during periodic token refresh:', error);
          } else if (data.session) {
            console.log('Token refreshed successfully');
          }
        } catch (err) {
          console.error('Exception during token refresh:', err);
        }
      });
    }, 10 * 60 * 1000); // 10 minutes
    
    return () => clearInterval(tokenRefreshInterval);
  }, [session]);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const setupAuthListener = async () => {
      try {
        // Get initial session first before setting up listeners
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
          // Initialize activity tracking on session found
          updateLastActivity();
        }
        
        // Set up auth state change listener
        const { data } = supabase.auth.onAuthStateChange(
          async (event, currentSession) => {
            console.log('Auth state changed:', event);
            
            if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
              setSession(null);
              setUser(null);
              
              // Clear any existing timeout warning
              if (timeoutWarningRef.current) {
                clearTimeout(timeoutWarningRef.current);
                timeoutWarningRef.current = null;
              }
              setShowTimeoutWarning(false);
            } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
              setSession(currentSession);
              setUser(currentSession?.user ?? null);
              authRetryCount.current = 0;
              
              // Update activity timestamp when signed in or token refreshed
              updateLastActivity();
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
  }, [toast, updateLastActivity]);

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
      
      // Clear any timeouts and hide warning dialog
      if (timeoutWarningRef.current) {
        clearTimeout(timeoutWarningRef.current);
        timeoutWarningRef.current = null;
      }
      setShowTimeoutWarning(false);
      
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

  const value = {
    session,
    user,
    loading,
    error,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      <SessionTimeoutDialog
        isOpen={showTimeoutWarning}
        onContinue={handleContinueSession}
        onLogout={signOut}
        timeoutMinutes={30} // Updated to match new timeout
      />
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
