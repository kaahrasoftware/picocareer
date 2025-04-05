
import { useState, useEffect, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { useLoading } from '@/context/LoadingContext';

// Timeout in minutes before showing warning
const SESSION_TIMEOUT_MINUTES = 30;

// Warning duration in minutes (how long to show the warning dialog)
const WARNING_DURATION_MINUTES = 5;

// How frequently to check for timeout in milliseconds
const CHECK_INTERVAL = 1000 * 60; // Check every minute

export function useSessionTimeout(session: Session | null, signOut: () => Promise<void>) {
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [showTimeoutWarning, setShowTimeoutWarning] = useState<boolean>(false);
  const { toast } = useToast();
  const { setIsLoading } = useLoading();

  // Reset activity timer when user interacts
  const resetActivityTimer = useCallback(() => {
    setLastActivity(Date.now());
    
    // If warning was showing, hide it
    if (showTimeoutWarning) {
      setShowTimeoutWarning(false);
    }
  }, [showTimeoutWarning]);

  // Handle continuing the session
  const handleContinueSession = useCallback(() => {
    resetActivityTimer();
    setShowTimeoutWarning(false);
  }, [resetActivityTimer]);

  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      setIsLoading(true);
      await signOut();
      toast({
        title: "Logged out",
        description: "You have been logged out due to inactivity",
      });
    } catch (error) {
      console.error('Error during timeout logout:', error);
      toast({
        title: "Error logging out",
        description: "There was an error logging you out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setShowTimeoutWarning(false);
    }
  }, [signOut, toast, setIsLoading]);

  // Check for session timeout
  useEffect(() => {
    if (!session) return; // Only check if user is logged in
    
    const now = Date.now();
    const inactiveTime = now - lastActivity;
    const timeoutTime = SESSION_TIMEOUT_MINUTES * 60 * 1000;
    const warningTime = (SESSION_TIMEOUT_MINUTES - WARNING_DURATION_MINUTES) * 60 * 1000;
    
    // Set up event listeners to reset timer
    const events = ['mousedown', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, resetActivityTimer);
    });
    
    // Set up interval to check for timeout
    const interval = setInterval(() => {
      const currentInactiveTime = Date.now() - lastActivity;
      
      // Show warning when approaching timeout
      if (currentInactiveTime > warningTime && !showTimeoutWarning) {
        setShowTimeoutWarning(true);
      }
      
      // Auto logout after full timeout period
      if (currentInactiveTime > timeoutTime) {
        handleLogout();
      }
    }, CHECK_INTERVAL);
    
    return () => {
      // Clean up
      events.forEach(event => {
        window.removeEventListener(event, resetActivityTimer);
      });
      clearInterval(interval);
    };
  }, [session, lastActivity, showTimeoutWarning, resetActivityTimer, handleLogout]);

  return {
    showTimeoutWarning,
    handleContinueSession,
    handleLogout,
  };
}
