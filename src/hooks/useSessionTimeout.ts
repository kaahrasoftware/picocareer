
import { useState, useRef, useCallback, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase, throttledAuthOperation } from "@/integrations/supabase/client";

// Session timeout configuration - 30 minutes
const SESSION_TIMEOUT_WARNING_MS = 30 * 60 * 1000; // 30 minutes
const SESSION_ACTIVITY_EVENTS = ['click', 'keypress', 'scroll', 'mousemove', 'touchstart'];
// Reduced activity threshold to prevent excessive updates
const ACTIVITY_UPDATE_THRESHOLD_MS = 60 * 1000; // Only update activity timestamp max once per minute

export function useSessionTimeout(session: Session | null, signOut: () => Promise<void>) {
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

  return {
    showTimeoutWarning,
    handleContinueSession,
    handleLogout: signOut
  };
}
