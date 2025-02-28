
import { useAuthSession } from "@/hooks/useAuthSession";
import { InvitationVerifier } from "@/components/hub/invite-response/InvitationVerifier";
import { ErrorState } from "@/components/hub/invite-response/ErrorState";
import { Navigate } from "react-router-dom";

export default function HubInviteResponse() {
  const { session, isError } = useAuthSession();
  
  // If not authenticated, redirect to auth page with return URL
  if (!session && !isError) {
    return <Navigate to="/auth?redirect=/hub-invite" replace />;
  }
  
  // Show error if there's an authentication error
  if (isError) {
    return <ErrorState error="There was a problem with your authentication. Please try signing in again." />;
  }

  // The InvitationVerifier component now handles authentication internally
  return <InvitationVerifier />;
}
