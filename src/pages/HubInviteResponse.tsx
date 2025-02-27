
import { useSearchParams } from "react-router-dom";
import { LoadingState } from "@/components/hub/invite-response/LoadingState";
import { ErrorState } from "@/components/hub/invite-response/ErrorState";
import { InvitationCard } from "@/components/hub/invite-response/InvitationCard";
import { useHubInvitation } from "@/hooks/hub/useHubInvitation";

export default function HubInviteResponse() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { 
    isLoading, 
    isProcessing, 
    invitation, 
    hub, 
    error,
    handleAccept,
    handleDecline
  } = useHubInvitation(token);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <div className="container max-w-2xl py-8">
      <InvitationCard
        hubName={hub.name}
        role={invitation.role}
        description={hub.description}
        isProcessing={isProcessing}
        onAccept={handleAccept}
        onDecline={handleDecline}
      />
    </div>
  );
}
