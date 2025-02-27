
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

  // Enhanced logging when component mounts with initial token
  useEffect(() => {
    console.log("InvitationVerifier mounted with initial token:", initialToken);
  }, [initialToken]);

  // Token verification
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        console.log("No token provided, showing manual entry form");
        return;
      }
      
      setIsLoading(true);
      setError(null);
      console.log("Starting verification for token:", token);
      
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
          cleanToken = formatToken(token);
          console.log("Using cleaned token:", cleanToken);
        } catch (tokenErr) {
          console.error("Token format error:", tokenErr);
          throw new Error("Invalid invitation token format. Please check the link or enter the token manually.");
        }
        
        // First, simply check if the token exists in the database
        // This helps debug if the token is valid but other conditions fail
        const { data: tokenExists, error: tokenCheckError } = await supabase
          .from('hub_member_invites')
          .select('id')
          .eq('token', cleanToken)
          .maybeSingle();
          
        if (tokenCheckError) {
          console.error("Token existence check error:", tokenCheckError);
        }
        
        console.log("Token existence check:", tokenExists ? "Found" : "Not found");
        
        if (!tokenExists) {
          console.error("Token not found in database:", cleanToken);
          throw new Error("Invitation not found. The token may be invalid or improperly formatted.");
        }
        
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
          console.error("Rate limit exceeded for token:", cleanToken);
          throw new Error("Too many verification attempts. Please try again later.");
        }

        console.log("Rate limit check passed");
        
        // Now run the full verification query with all conditions
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
          .eq('token', cleanToken);
          
        if (inviteError) {
          console.error("Error fetching invitation:", inviteError);
          throw new Error("Could not verify invitation token");
        }
        
        if (!invites || invites.length === 0) {
          console.error("No invitation found for token:", cleanToken);
          throw new Error("Invitation not found. The link may be invalid or expired.");
        }
        
        const invite = invites[0];
        console.log("Found invitation:", invite);
        
        // Now check specific conditions after finding the token
        // 1. Check status
        if (invite.status !== 'pending') {
          console.error("Invitation status is not pending:", invite.status);
          throw new Error(`This invitation has already been ${invite.status}. No further action is needed.`);
        }
        
        // 2. Check if invitation is for the current user
        if (invite.invited_email !== user.email) {
          console.error("Email mismatch:", { inviteEmail: invite.invited_email, userEmail: user.email });
          throw new Error(`This invitation was sent to ${invite.invited_email}. Please sign in with that email address.`);
        }
        
        // 3. Check if invitation is expired
        const now = new Date();
        const expiryDate = new Date(invite.expires_at);
        
        console.log("Checking expiry:", { 
          now: now.toISOString(), 
          expires: invite.expires_at,
          isExpired: expiryDate < now
        });
        
        if (expiryDate < now) {
          console.error("Invitation expired:", invite.expires_at);
          throw new Error("This invitation has expired. Please request a new invitation.");
        }
        
        // Log verification attempt
        await supabase.from('hub_invite_verification_attempts').insert({
          token: cleanToken,
          success: true
        });
        
        console.log("Verification successful, logging attempt");
        
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
