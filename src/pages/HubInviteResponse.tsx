
import { useAuthSession } from "@/hooks/useAuthSession";
import { InvitationVerifier } from "@/components/hub/invite-response/InvitationVerifier";
import { ErrorState } from "@/components/hub/invite-response/ErrorState";

export default function HubInviteResponse() {
  const { session, isError } = useAuthSession();
  
  // Show error if there's an authentication error
  if (isError) {
    return <ErrorState error="There was a problem with your authentication. Please try signing in again." />;
  }

  // The InvitationVerifier component now handles authentication state internally
  return <InvitationVerifier />;
}
