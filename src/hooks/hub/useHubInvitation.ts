
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export function useHubInvitation(token: string | null) {
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [invitation, setInvitation] = useState<any>(null);
  const [hub, setHub] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
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

        // Clean token - remove quotes, whitespace, and URL encoding
        const cleanToken = decodeURIComponent(token.replace(/['"]/g, '').trim());
        console.log('Using cleaned token:', cleanToken);

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

        // First check if invitation exists at all
        const { data: invites, error: inviteError } = await supabase
          .from('hub_member_invites')
          .select('*')
          .eq('token', cleanToken);

        if (inviteError) {
          console.error('Error fetching invitation:', inviteError);
          setError("Error loading invitation");
          setIsLoading(false);
          return;
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

        if (invite.status !== 'pending') {
          console.log('Invalid invitation status:', invite.status);
          setError("This invitation has already been processed");
          setIsLoading(false);
          return;
        }

        if (new Date(invite.expires_at) < new Date()) {
          console.log('Invitation expired:', invite.expires_at);
          setError("This invitation has expired");
          setIsLoading(false);
          return;
        }

        // Get hub details
        const { data: hubData, error: hubError } = await supabase
          .from('hubs')
          .select('*')
          .eq('id', invite.hub_id)
          .single();

        if (hubError || !hubData) {
          console.error('Error fetching hub:', hubError);
          setError(hubError?.message || "Hub not found");
          setIsLoading(false);
          return;
        }

        console.log('Found hub:', hubData);

        // Log the verification attempt
        await supabase
          .from('hub_invite_verification_attempts')
          .insert({
            token: cleanToken,
            success: true
          });

        setInvitation(invite);
        setHub(hubData);
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

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('Auth error in handleResponse:', userError);
        throw userError;
      }

      if (!user) {
        throw new Error("Please sign in to accept/decline the invitation");
      }

      const cleanToken = token?.replace(/['"]/g, '').trim();

      // Validate invitation status again before processing
      const { data: invites, error: inviteError } = await supabase
        .from('hub_member_invites')
        .select('*')
        .eq('token', cleanToken)
        .eq('invited_email', user.email);

      if (inviteError || !invites || invites.length === 0) {
        console.log('No invitation found for token in handleResponse:', cleanToken);
        throw new Error("Invitation not found");
      }

      const invite = invites[0];

      if (invite.status !== 'pending') {
        console.log('Invalid status in handleResponse:', invite.status);
        throw new Error("This invitation has already been processed");
      }

      if (new Date(invite.expires_at) < new Date()) {
        console.log('Invitation expired in handleResponse:', invite.expires_at);
        throw new Error("This invitation has expired");
      }

      const timestamp = new Date().toISOString();
      
      if (accept) {
        console.log('Creating hub member record');
        // Create hub member record
        const { error: memberError } = await supabase
          .from('hub_members')
          .insert({
            hub_id: invitation.hub_id,
            profile_id: user.id,
            role: invitation.role,
            status: 'Approved',
          });

        if (memberError) {
          console.error('Error creating member record:', memberError);
          throw memberError;
        }
      }

      console.log('Updating invitation status to:', accept ? 'accepted' : 'rejected');

      // Update invitation status
      const { error: updateError } = await supabase
        .from('hub_member_invites')
        .update({
          status: accept ? 'accepted' : 'rejected',
          accepted_at: accept ? timestamp : null,
          rejected_at: accept ? null : timestamp,
        })
        .eq('token', cleanToken)
        .eq('invited_email', user.email);

      if (updateError) {
        console.error('Error updating invitation status:', updateError);
        throw updateError;
      }

      // Log the audit event
      console.log('Logging audit event');
      await supabase.rpc('log_hub_audit_event', {
        _hub_id: invitation.hub_id,
        _action: accept ? 'member_added' : 'member_invitation_cancelled',
        _details: { role: invitation.role }
      });

      toast({
        title: accept ? "Invitation Accepted" : "Invitation Declined",
        description: accept 
          ? `You are now a member of ${hub.name}`
          : `You have declined the invitation to join ${hub.name}`,
      });

      // Redirect to hub page if accepted
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
    handleAccept: () => handleResponse(true),
    handleDecline: () => handleResponse(false)
  };
}
