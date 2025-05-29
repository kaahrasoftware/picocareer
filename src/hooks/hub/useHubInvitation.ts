
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import type { UseHubInvitationReturn, HubInvite, Hub } from "./types/invitation";
import { formatToken } from "./utils/tokenUtils";
import { handleInvitationResponse } from "./utils/invitationResponse";

export function useHubInvitation(token: string | null): UseHubInvitationReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [invitation, setInvitation] = useState<HubInvite | null>(null);
  const [hub, setHub] = useState<Hub | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        if (!token) {
          console.log('No token provided');
          setError("Invalid invitation link");
          setIsLoading(false);
          return;
        }

        // First check if user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) {
          console.error('Auth error:', authError);
          throw authError;
        }
        
        if (!user) {
          console.log('No authenticated user found');
          setError("Please sign in to view this invitation");
          setIsLoading(false);
          return;
        }

        // Format and validate token
        let cleanToken;
        try {
          cleanToken = formatToken(token);
          console.log('Using cleaned token:', cleanToken);
        } catch (e) {
          console.error('Token formatting error:', e);
          setError("Invalid invitation token format");
          setIsLoading(false);
          return;
        }

        // Check rate limit first
        const { data: rateCheckData, error: rateCheckError } = await supabase
          .rpc('check_verification_rate_limit', {
            _token: cleanToken,
            _ip_address: null // IP is handled server-side for security
          });

        if (rateCheckError) {
          console.error('Rate check error:', rateCheckError);
          throw new Error("Unable to verify token at this time");
        }

        if (!rateCheckData) {
          throw new Error("Too many verification attempts. Please try again later.");
        }

        // Fetch invitation with exact token match
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
          console.error('Error fetching invitation:', inviteError);
          throw new Error("Error loading invitation");
        }

        if (!invites || invites.length === 0) {
          console.log('No invitation found for token:', cleanToken);
          setError("Invitation not found. The link may be invalid or expired.");
          setIsLoading(false);
          return;
        }

        const invite = invites[0];
        console.log('Found invitation:', invite);

        // Now check if the invitation is for the current user
        if (invite.invited_email !== user.email) {
          console.log('Email mismatch:', { inviteEmail: invite.invited_email, userEmail: user.email });
          setError(`This invitation was sent to ${invite.invited_email}. Please sign in with that email address.`);
          setIsLoading(false);
          return;
        }

        // Extract hub data from the nested join
        const hubData = invite.hub;
        delete invite.hub; // Remove nested data before setting invitation

        // Log the verification attempt
        await supabase
          .from('hub_invite_verification_attempts')
          .insert({
            token: cleanToken,
            success: true
          });

        setInvitation(invite);
        setHub(hubData);
        setShowSuccessDialog(true);
        setIsLoading(false);
      } catch (error: any) {
        console.error('Error in fetchInvitation:', error);
        setError(error.message || "Failed to load invitation");
        setIsLoading(false);
      }
    };

    fetchInvitation();
  }, [token]);

  const handleResponse = async (accept: boolean) => {
    try {
      setIsProcessing(true);
      if (!invitation || !hub) {
        throw new Error("Invalid invitation state");
      }
      await handleInvitationResponse(accept, invitation, hub);
      if (accept) {
        navigate(`/hubs/${hub.id}`);
      } else {
        navigate("/hubs");
      }
    } catch (error: any) {
      console.error('Error processing invitation:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isLoading,
    isProcessing,
    invitation,
    hub,
    error,
    showSuccessDialog,
    setShowSuccessDialog,
    handleAccept: () => handleResponse(true),
    handleDecline: () => handleResponse(false)
  };
}
