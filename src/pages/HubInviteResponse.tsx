
import { useEffect, useState } from "react";
import { useAuthSession } from "@/hooks/useAuthSession";
import { InvitationVerifier } from "@/components/hub/invite-response/InvitationVerifier";
import { ErrorState } from "@/components/hub/invite-response/ErrorState";
import { useLocation } from "react-router-dom";

export default function HubInviteResponse() {
  const { session } = useAuthSession();
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  
  // Extract token from URL if present for redirection purposes
  const getTokenFromUrl = (): string | null => {
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');
    
    if (token) return token;
    
    // Check if token is in the path part instead
    const pathMatch = location.pathname.match(/\/hub-invite\/([^/?]+)/);
    if (pathMatch && pathMatch[1]) return pathMatch[1];
    
    return null;
  };
  
  const token = getTokenFromUrl();
  
  useEffect(() => {
    // If we have a Hub ID in the path, it might be misnavigation from a notification
    // Redirect to the proper invite verification page with token
    const hubIdMatch = location.pathname.match(/\/hubs\/([^/?]+)/);
    if (hubIdMatch && hubIdMatch[1]) {
      console.log("Detected hub ID in path, redirecting to proper invite page");
      window.location.href = "/hub-invite";
    }
  }, [location.pathname]);
  
  // If not authenticated, redirect to auth page with return URL
  useEffect(() => {
    if (!session) {
      const redirectPath = token ? `/hub-invite?token=${token}` : "/hub-invite";
      window.location.href = `/auth?redirect=${redirectPath}`;
    }
  }, [session, token]);
  
  // Show error if there's an authentication error
  if (error) {
    return <ErrorState error={error} />;
  }

  // If no session, show loading while the redirect happens
  if (!session) {
    return <div>Loading...</div>;
  }

  // The InvitationVerifier component handles the rest of the verification internally
  return <InvitationVerifier />;
}
