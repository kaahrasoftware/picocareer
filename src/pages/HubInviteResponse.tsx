
import { useLocation } from "react-router-dom";
import { InvitationVerifier } from "@/components/hub/invite-response/InvitationVerifier";
import { ErrorState } from "@/components/hub/invite-response/ErrorState";

export default function HubInviteResponse() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const action = searchParams.get('action');
  const token = searchParams.get('token');

  // Enhanced logging for debugging token extraction
  console.log("URL Parameters:", { 
    action, 
    token, 
    rawUrl: location.search,
    pathname: location.pathname
  });

  // Validate action parameter
  if (!action) {
    return <ErrorState error="Invalid request: Missing action parameter" />;
  }

  // Process the invitation
  return <InvitationVerifier token={token} />;
}
