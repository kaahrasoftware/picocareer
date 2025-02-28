
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { formatToken } from "@/hooks/hub/utils/tokenUtils";
import { useToast } from "@/hooks/use-toast";
import { useAuthSession } from "@/hooks/useAuthSession";
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
  const [needsAuth, setNeedsAuth] = useState<boolean>(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = useAuthSession();

  // Check for token in URL parameters on component mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenFromUrl = params.get('token');
    
    if (tokenFromUrl) {
      console.log("Found token in URL:", tokenFromUrl);
      handleVerify(tokenFromUrl);
    }
  }, [location.search]);

  // Check if user is authenticated
  useEffect(() => {
    if (needsAuth && session) {
      setNeedsAuth(false);
      // If we had a previous auth error but now we're authenticated, try again with the token from URL
      const params = new URLSearchParams(location.search);
      const tokenFromUrl = params.get('token');
      if (tokenFromUrl) {
        console.log("Re-attempting verification with token after authentication:", tokenFromUrl);
        handleVerify(tokenFromUrl);
      }
    }
  }, [session, needsAuth]);

  // Handle token verification when submitted from the form or URL
  const handleVerify = async (inputToken: string) => {
    if (!inputToken) {
      setError("Please enter a verification token");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    console.log("Starting verification for token:", inputToken);
    
    try {
      // Check user authentication using the session from useAuthSession
      if (!session || !session.user) {
        console.log("No authenticated session found, redirecting to auth");
        setNeedsAuth(true);
        
        // Store the token in the URL for when the user returns after authentication
        navigate(`/auth?redirect=/hub-invite?token=${inputToken}`);
        throw new Error("Please sign in to verify this invitation.");
      }
      
      const user = session.user;
      console.log("Authenticated user:", user.email);
      
      // Format and validate token
      let cleanToken;
      try {
        cleanToken = formatToken(inputToken);
        console.log("Using cleaned token:", cleanToken);
      } catch (tokenErr: any) {
        console.error("Token format error:", tokenErr);
        throw new Error(tokenErr.message || "Invalid invitation token format. Please check the token and try again.");
      }
      
      // Look up the invitation in the database
      console.log("Looking up invitation with token:", cleanToken);
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
      
      if (inviteError) {
        console.error("Invitation fetch error:", inviteError);
        
        // Try to determine if the token exists but might have other issues
        const { count, error: countError } = await supabase
          .from('hub_member_invites')
          .select('*', { count: 'exact', head: true })
          .eq('token', cleanToken);
          
        if (!countError && count === 0) {
          throw new Error("Invitation not found. The token may be invalid or expired.");
        } else {
          throw new Error("Could not retrieve invitation details. Please try again later.");
        }
      }
      
      if (!invitation) {
        console.error("No invitation found for token:", cleanToken);
        throw new Error("Invitation not found. The token may be invalid.");
      }
      
      console.log("Found invitation:", invitation);
      
      // Check invitation status
      if (invitation.status !== 'pending') {
        console.error("Invitation status is not pending:", invitation.status);
        throw new Error(`This invitation has already been ${invitation.status}. No further action is needed.`);
      }
      
      // Check if the invitation has expired
      const expiryDate = new Date(invitation.expires_at);
      const now = new Date();
      
      if (expiryDate < now) {
        console.error("Invitation expired:", invitation.expires_at);
        throw new Error("This invitation has expired. Please request a new invitation.");
      }
      
      // Check if the invitation is for the current user
      if (invitation.invited_email !== user.email) {
        console.error("Email mismatch:", { inviteEmail: invitation.invited_email, userEmail: user.email });
        throw new Error(`This invitation was sent to ${invitation.invited_email}. Please sign in with that email address.`);
      }
      
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
      
      // Show success message
      toast({
        title: "Verification Successful",
        description: `Found invitation to join ${hubData.name}`,
      });
      
    } catch (err: any) {
      console.error("Token verification error:", err);
      
      // If auth error, don't log the attempt since user will be redirected
      if (!needsAuth) {
        // Log failed verification attempt
        try {
          await supabase.from('hub_invite_verification_attempts').insert({
            token: inputToken,
            success: false,
            error_message: err.message
          });
        } catch (logError) {
          console.error("Failed to log verification attempt:", logError);
        }
        
        toast({
          title: "Verification Failed",
          description: err.message || "Invalid invitation token",
          variant: "destructive",
        });
      }
      
      setError(err.message || "Failed to verify invitation token");
    } finally {
      if (!needsAuth) {
        setIsLoading(false);
      }
    }
  };

  // If we need auth and are not authenticated, show auth-required error
  if (needsAuth) {
    return <ErrorState error="Please sign in to verify this invitation. Redirecting to authentication page..." />;
  }

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
