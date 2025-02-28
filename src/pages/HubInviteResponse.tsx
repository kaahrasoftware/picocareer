
import { InvitationVerifier } from "@/components/hub/invite-response/InvitationVerifier";

export default function HubInviteResponse() {
  // The InvitationVerifier component now handles URL parameters internally
  return <InvitationVerifier />;
}
