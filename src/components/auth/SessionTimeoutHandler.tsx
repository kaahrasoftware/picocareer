
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";
import { SessionTimeoutDialog } from "@/components/auth/SessionTimeoutDialog";

/**
 * Component that handles session timeout warnings and auto-refresh
 * This is a global component that should be mounted once at the app root
 */
export function SessionTimeoutHandler() {
  const { session, signOut } = useAuth();
  const { 
    showTimeoutWarning, 
    handleContinueSession, 
    handleLogout 
  } = useSessionTimeout(session, signOut);

  // Use an effect to ensure we can refresh token whenever route changes
  // This provides an additional layer of session persistence
  useEffect(() => {
    if (session) {
      // Create a heartbeat to refresh the session token
      const heartbeatInterval = setInterval(() => {
        // If the session is valid, we'll silently refresh it
        if (session.expires_at) {
          const expiryTime = new Date(session.expires_at * 1000);
          const now = new Date();
          const timeUntilExpiry = expiryTime.getTime() - now.getTime();
          
          // If session will expire in less than 10 minutes, refresh it
          // This is a more aggressive refresh than before (changed from 5 to 10 minutes)
          if (timeUntilExpiry < 10 * 60 * 1000 && timeUntilExpiry > 0) {
            handleContinueSession();
          }
        }
      }, 60000); // Check every minute
      
      return () => clearInterval(heartbeatInterval);
    }
  }, [session, handleContinueSession]);

  return (
    <SessionTimeoutDialog
      isOpen={showTimeoutWarning}
      onContinue={handleContinueSession}
      onLogout={handleLogout}
      timeoutMinutes={30}
    />
  );
}
