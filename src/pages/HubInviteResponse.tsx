
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useHubInvitation } from "@/hooks/hub/useHubInvitation";
import { InvitationCard } from "@/components/hub/invite-response/InvitationCard";
import { LoadingState } from "@/components/hub/invite-response/LoadingState";
import { ErrorState } from "@/components/hub/invite-response/ErrorState";

export default function HubInviteResponse() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const rawToken = searchParams.get('token');
  const action = searchParams.get('action');

  // Clean and decode token before using it
  const token = rawToken ? decodeURIComponent(rawToken.replace(/['"]/g, '').trim()) : null;
  console.log('Cleaned token:', token); // Debug log

  const {
    isLoading,
    isProcessing,
    invitation,
    hub,
    error,
    handleAccept,
    handleDecline,
  } = useHubInvitation(token);

  // Automatically trigger the intended action if provided in URL
  useEffect(() => {
    if (!isLoading && !error && action && !isProcessing) {
      if (action === 'accept') {
        handleAccept();
      } else if (action === 'reject') {
        handleDecline();
      }
    }
  }, [isLoading, error, action, isProcessing, handleAccept, handleDecline]);

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
