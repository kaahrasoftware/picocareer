
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useHubInvitation } from "@/hooks/hub/useHubInvitation";
import { InvitationCard } from "@/components/hub/invite-response/InvitationCard";
import { LoadingState } from "@/components/hub/invite-response/LoadingState";
import { ErrorState } from "@/components/hub/invite-response/ErrorState";
import { TokenVerificationForm } from "@/components/hub/invite-response/TokenVerificationForm";

export default function HubInviteResponse() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const action = searchParams.get('action');
  const [token, setToken] = useState<string | null>(null);

  const {
    isLoading,
    isProcessing,
    invitation,
    hub,
    error,
    handleAccept,
    handleDecline,
  } = useHubInvitation(token);

  if (!action) {
    return <ErrorState error="Invalid request" />;
  }

  if (!token) {
    return <TokenVerificationForm onVerify={setToken} />;
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!invitation || !hub) {
    return <ErrorState error="Invalid invitation" />;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
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
