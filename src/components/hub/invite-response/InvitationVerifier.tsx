
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { formatToken } from "@/hooks/hub/utils/tokenUtils";
import { useToast } from "@/hooks/use-toast";
import type { HubInvite, Hub } from "@/hooks/hub/types/invitation";
import { TokenVerificationForm } from "./TokenVerificationForm";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";
import { InvitationDetailsDialog } from "./InvitationDetailsDialog";

export function InvitationVerifier() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [invitation, setInvitation] = useState<HubInvite | null>(null);
  const [hub, setHub] = useState<Hub | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState<boolean>(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Handle token verification when submitted from the form
  const handleVerify = async (inputToken: string) => {
    if (!inputToken) {
      setError("Please enter a verification token");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    console.log("Starting verification for token:", inputToken);
    
    try {
      // Check user authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error("Auth error:", authError);
        throw new Error("Authentication error. Please sign in again.");
      }
      
      if (!user) {
        console.error("No authenticated user found");
        throw new Error("Please sign in to view this invitation");
      }
      
      console.log("Authenticated user:", user.email);
      
      // Format and validate token
      let cleanToken;
      try {
        cleanToken = formatToken(inputToken);
        console.log("Using cleaned token:", cleanToken);
      } catch (tokenErr) {
        console.error("Token format error:", tokenErr);
        throw new Error("Invalid invitation token format. Please check the token and try again.");
      }
      
      // First, do a simple existence check for the token and validate it matches the current user
      console.log("Performing token validation check for:", cleanToken);
      const { data: tokenCheck, error: tokenCheckError } = await supabase
        .from('hub_member_invites')
        .select('id, status, invited_email, expires_at')
        .eq('token', cleanToken)
        .single();
      
      if (tokenCheckError) {
        console.error("Token validation check error:", tokenCheckError);
        throw new Error("Invitation not found. The token may be invalid or expired.");
      }
      
      console.log("Token validation passed:", tokenCheck);
      
      // Additional validations
      if (tokenCheck.status !== 'pending') {
        console.error("Invitation status is not pending:", tokenCheck.status);
        throw new Error(`This invitation has already been ${tokenCheck.status}. No further action is needed.`);
      }
      
      if (tokenCheck.invited_email !== user.email) {
        console.error("Email mismatch:", { inviteEmail: tokenCheck.invited_email, userEmail: user.email });
        throw new Error(`This invitation was sent to ${tokenCheck.invited_email}. Please sign in with that email address.`);
      }
      
      const expiryDate = new Date(tokenCheck.expires_at);
      const now = new Date();
      console.log("Checking expiry:", { 
        now: now.toISOString(), 
        expires: tokenCheck.expires_at,
        isExpired: expiryDate < now
      });
      
      if (expiryDate < now) {
        console.error("Invitation expired:", tokenCheck.expires_at);
        throw new Error("This invitation has expired. Please request a new invitation.");
      }
      
      // Now fetch the full invitation with hub details
      console.log("Fetching complete invitation data");
      const { data: invitation, error: inviteError } = await supabase
        .from('hub_member_invites')
        .select(`
          *,
          hub:hubs (
            id,
            name,
            description,
            logo_url
          )
        `)
        .eq('token', cleanToken)
        .single();
      
      if (inviteError || !invitation) {
        console.error("Invitation fetch error:", inviteError);
        throw new Error("Could not retrieve invitation details.");
      }
      
      console.log("Full invitation data retrieved:", invitation);
      
      // Log verification attempt 
      try {
        await supabase.from('hub_invite_verification_attempts').insert({
          token: cleanToken,
          success: true
        });
        console.log("Verification attempt logged successfully");
      } catch (logError) {
        console.error("Failed to log verification attempt:", logError);
        // Continue anyway, this is not critical
      }
      
      // Extract hub data and store invitation
      const hubData = invitation.hub as Hub;
      
      // Convert database role to HubMemberRole type
      const typedInvite: HubInvite = {
        id: invitation.id,
        hub_id: invitation.hub_id,
        invited_email: invitation.invited_email,
        token: invitation.token,
        role: invitation.role as any, // Cast to handle all possible role types
        status: invitation.status as any, // Cast to handle status
        expires_at: invitation.expires_at,
        created_at: invitation.created_at,
        updated_at: invitation.updated_at,
        accepted_at: invitation.accepted_at,
        rejected_at: invitation.rejected_at
      };
      
      setInvitation(typedInvite);
      setHub(hubData);
      setShowDetailsDialog(true);
      console.log("Setting invitation details and showing dialog");
      
    } catch (err: any) {
      console.error("Token verification error:", err);
      setError(err.message || "Failed to verify invitation token");
      
      toast({
        title: "Verification Failed",
        description: err.message || "Invalid invitation token",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while verifying
  if (isLoading) {
    return <LoadingState />;
  }
  
  // Show error state if verification failed
  if (error) {
    return <ErrorState error={error} />;
  }
  
  // Show the token entry form if no verification is in progress and no invitation found
  if (!invitation) {
    return <TokenVerificationForm onVerify={handleVerify} />;
  }
  
  // Return the invitation dialog component if verification was successful
  return (
    <>
      {invitation && hub && (
        <InvitationDetailsDialog
          invitation={invitation}
          hub={hub}
          isOpen={showDetailsDialog}
          onOpenChange={setShowDetailsDialog}
        />
      )}
    </>
  );
}
