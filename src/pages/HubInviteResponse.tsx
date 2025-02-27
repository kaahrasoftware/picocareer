
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useHubInvitation } from "@/hooks/hub/useHubInvitation";
import { InvitationCard } from "@/components/hub/invite-response/InvitationCard";
import { LoadingState } from "@/components/hub/invite-response/LoadingState";
import { ErrorState } from "@/components/hub/invite-response/ErrorState";
import { TokenVerificationForm } from "@/components/hub/invite-response/TokenVerificationForm";
import { SuccessDialog } from "@/hooks/hub/components/SuccessDialog";

export default function HubInviteResponse() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const action = searchParams.get('action');
  const paramToken = searchParams.get('token');
  const [token, setToken] = useState<string | null>(paramToken);

  // Debug
  useEffect(() => {
    console.log("URL Parameters:", {
      action,
      paramToken,
      currentToken: token
    });
  }, [action, paramToken, token]);

  const {
    isLoading,
    isProcessing,
    invitation,
    hub,
    error,
    showSuccessDialog,
    setShowSuccessDialog,
    handleAccept,
    handleDecline,
  } = useHubInvitation(token);

  // If no action is specified
  if (!action) {
    return <ErrorState error="Invalid request: Missing action parameter" />;
  }

  // If no token is provided
  if (!token) {
    return <TokenVerificationForm onVerify={setToken} />;
  }

  // While loading
  if (isLoading) {
    return <LoadingState />;
  }

  // If there's an error
  if (error) {
    return <ErrorState error={error} />;
  }

  // If invitation or hub is missing
  if (!invitation || !hub) {
    return <ErrorState error="Invalid invitation: Could not find invitation details" />;
  }

  // Success case
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
      <SuccessDialog 
        isOpen={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
        hub={hub}
      />
    </div>
  );
}
