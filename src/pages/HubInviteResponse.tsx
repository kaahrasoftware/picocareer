
import { InvitationVerifier } from "@/components/hub/invite-response/InvitationVerifier";

export default function HubInviteResponse() {
  // Simplified page that only focuses on manual token verification
  // No URL parameter checks needed
  return <InvitationVerifier />;
}
