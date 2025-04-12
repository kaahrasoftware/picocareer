
import { useState, useRef, useCallback, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase, throttledAuthOperation } from "@/integrations/supabase/client";

// Session timeout configuration - 30 minutes
const SESSION_TIMEOUT_WARNING_MS = 30 * 60 * 1000; // 30 minutes
const SESSION_ACTIVITY_EVENTS = ['click', 'keypress', 'scroll', 'mousemove', 'touchstart', 'focus', 'visibilitychange'];
// Reduced activity threshold to prevent excessive updates
const ACTIVITY_UPDATE_THRESHOLD_MS = 30 * 1000; // Only update activity timestamp max once per 30 seconds

export function useSessionTimeout(session: Session | null, signOut: () => Promise<void>) {
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const timeoutWarningRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const lastActivityUpdateRef = useRef<number>(Date.now());
  const sessionRefreshAttempts = useRef<number>(0);
  const maxRetryAttempts = 3;

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
  const handleContinueSession = useCallback(async () => {
    setShowTimeoutWarning(false);
    updateLastActivity();
    
    // Proactively refresh the token when user continues session
    if (session) {
      sessionRefreshAttempts.current = 0; // Reset attempts counter
      
      const refreshSession = async () => {
        try {
          const { data, error } = await supabase.auth.refreshSession();
          
          if (error) {
            console.error('Error refreshing session during continue:', error);
            
            // Implement retry logic with exponential backoff
            if (sessionRefreshAttempts.current < maxRetryAttempts) {
              sessionRefreshAttempts.current++;
              const backoffTime = 1000 * Math.pow(2, sessionRefreshAttempts.current);
              console.log(`Retrying session refresh in ${backoffTime/1000}s (attempt ${sessionRefreshAttempts.current}/${maxRetryAttempts})`);
              
              setTimeout(() => {
                refreshSession();
              }, backoffTime);
            }
            return false;
          } else if (data.session) {
            console.log('Session refreshed successfully');
            sessionRefreshAttempts.current = 0;
            return true;
          }
        } catch (err) {
          console.error('Exception during session refresh:', err);
          return false;
        }
      };
      
      throttledAuthOperation(refreshSession);
    }
  }, [updateLastActivity, session]);

  // Handle user activity with passive event listeners
  useEffect(() => {
    if (!session?.user) return;
    
    const passiveEventHandler = () => {
      // Use requestAnimationFrame to debounce activity updates
      requestAnimationFrame(updateLastActivity);
    };
    
    // Document visibility change handler - refresh session when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // When tab becomes visible, check if we need to refresh the session
        if (session) {
          const now = Date.now();
          const lastActivity = lastActivityRef.current;
          
          // If user has been inactive for more than 5 minutes, refresh session
          if (now - lastActivity > 5 * 60 * 1000) {
            handleContinueSession();
          }
        }
      }
    };
    
    // Setup activity listeners with passive option for better performance
    SESSION_ACTIVITY_EVENTS.forEach(event => {
      if (event === 'visibilitychange') {
        document.addEventListener(event, handleVisibilityChange, { passive: true });
      } else {
        window.addEventListener(event, passiveEventHandler, { passive: true });
      }
    });
    
    // Initial activity timestamp and warning timeout
    updateLastActivity();
    
    return () => {
      // Cleanup
      SESSION_ACTIVITY_EVENTS.forEach(event => {
        if (event === 'visibilitychange') {
          document.removeEventListener(event, handleVisibilityChange);
        } else {
          window.removeEventListener(event, passiveEventHandler);
        }
      });
      
      if (timeoutWarningRef.current) {
        clearTimeout(timeoutWarningRef.current);
      }
    };
  }, [session, updateLastActivity, handleContinueSession]);

  // Setup periodic token refresh to prevent expiration
  useEffect(() => {
    if (!session?.user) return;
    
    // Refresh token every 5 minutes (reduced from 10 minutes)
    const tokenRefreshInterval = setInterval(() => {
      throttledAuthOperation(async () => {
        try {
          // Only refresh if the session is at risk of expiring soon
          if (session.expires_at) {
            const expiryTime = new Date(session.expires_at * 1000);
            const now = new Date();
            const timeUntilExpiry = expiryTime.getTime() - now.getTime();
            
            // If session will expire in less than 30 minutes, refresh it
            if (timeUntilExpiry < 30 * 60 * 1000) {
              const { data, error } = await supabase.auth.refreshSession();
              
              if (error) {
                console.error('Error during periodic token refresh:', error);
              } else if (data.session) {
                console.log('Token refreshed successfully');
              }
            }
          }
        } catch (err) {
          console.error('Exception during token refresh:', err);
        }
      });
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(tokenRefreshInterval);
  }, [session]);

  // Recovery mechanism - try to recover session on window focus
  useEffect(() => {
    const handleWindowFocus = async () => {
      if (session) {
        await handleContinueSession();
      }
    };
    
    window.addEventListener('focus', handleWindowFocus);
    
    return () => {
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [session, handleContinueSession]);

  return {
    showTimeoutWarning,
    handleContinueSession,
    handleLogout: signOut
  };
}
