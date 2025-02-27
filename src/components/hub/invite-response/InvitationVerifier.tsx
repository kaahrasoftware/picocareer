
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { formatToken } from "@/hooks/hub/utils/tokenUtils";
import { useToast } from "@/hooks/use-toast";
import type { HubInvite, Hub } from "@/hooks/hub/types/invitation";
import { TokenVerificationForm } from "./TokenVerificationForm";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";
import { InvitationDetailsDialog } from "./InvitationDetailsDialog";

interface InvitationVerifierProps {
  token: string | null;
}

export function InvitationVerifier({ token: initialToken }: InvitationVerifierProps) {
  const [token, setToken] = useState<string | null>(initialToken);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [invitation, setInvitation] = useState<HubInvite | null>(null);
  const [hub, setHub] = useState<Hub | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState<boolean>(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Token verification
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Check user authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error("Auth error:", authError);
          throw new Error("Authentication error. Please sign in again.");
        }
        
        if (!user) {
          throw new Error("Please sign in to view this invitation");
        }
        
        // Format and validate token
        const cleanToken = formatToken(token);
        console.log("Using cleaned token:", cleanToken);
        
        // Verify rate limit
        const { data: rateCheck, error: rateError } = await supabase
          .rpc('check_verification_rate_limit', {
            _token: cleanToken,
            _ip_address: null
          });
          
        if (rateError) {
          console.error("Rate limit check error:", rateError);
          throw new Error("Verification limit reached. Please try again later.");
        }
        
        if (!rateCheck) {
          throw new Error("Too many verification attempts. Please try again later.");
        }
        
        // Fetch the invitation
        const { data: invites, error: inviteError } = await supabase
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
          .eq('status', 'pending');
          
        if (inviteError) {
          console.error("Error fetching invitation:", inviteError);
          throw new Error("Could not verify invitation token");
        }
        
        if (!invites || invites.length === 0) {
          console.log("No invitation found for token:", cleanToken);
          throw new Error("Invitation not found. The link may be invalid or expired.");
        }
        
        const invite = invites[0];
        console.log("Found invitation:", invite);
        
        // Check if invitation is for the current user
        if (invite.invited_email !== user.email) {
          console.error("Email mismatch:", { inviteEmail: invite.invited_email, userEmail: user.email });
          throw new Error(`This invitation was sent to ${invite.invited_email}. Please sign in with that email address.`);
        }
        
        // Check if invitation is expired
        if (new Date(invite.expires_at) < new Date()) {
          console.error("Invitation expired:", invite.expires_at);
          throw new Error("This invitation has expired");
        }
        
        // Log verification attempt
        await supabase.from('hub_invite_verification_attempts').insert({
          token: cleanToken,
          success: true
        });
        
        // Extract hub data and store invitation
        const hubData = invite.hub;
        
        // Convert database role to HubMemberRole type
        const typedInvite: HubInvite = {
          id: invite.id,
          hub_id: invite.hub_id,
          invited_email: invite.invited_email,
          token: invite.token,
          role: invite.role,
          status: invite.status,
          expires_at: invite.expires_at,
          created_at: invite.created_at,
          updated_at: invite.updated_at,
          accepted_at: invite.accepted_at,
          rejected_at: invite.rejected_at
        };
        
        setInvitation(typedInvite);
        setHub(hubData);
        setShowDetailsDialog(true);
        
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
    
    verifyToken();
  }, [token, toast]);
  
  // If no token is provided, show the form
  if (!token) {
    return <TokenVerificationForm onVerify={setToken} />;
  }
  
  // Show loading state while verifying
  if (isLoading) {
    return <LoadingState />;
  }
  
  // Show error state if verification failed
  if (error) {
    return <ErrorState error={error} />;
  }
  
  // Return the invitation dialog component
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
