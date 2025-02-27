
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
          setError("Invalid invitation link");
          setIsLoading(false);
          return;
        }

        // First check if user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        
        if (!user) {
          setError("Please sign in to view this invitation");
          setIsLoading(false);
          return;
        }

        console.log('Fetching invitation with token:', token);

        const { data: invite, error: inviteError } = await supabase
          .from('hub_member_invites')
          .select('*')
          .eq('token', token)
          .eq('invited_email', user.email) // Fixed: Changed 'email' to 'invited_email'
          .maybeSingle();

        if (inviteError) {
          console.error('Error fetching invitation:', inviteError);
          setError("Failed to load invitation");
          setIsLoading(false);
          return;
        }

        if (!invite) {
          setError("Invitation not found");
          setIsLoading(false);
          return;
        }

        console.log('Found invitation:', invite);

        if (invite.status !== 'pending') {
          setError("This invitation has already been processed");
          setIsLoading(false);
          return;
        }

        if (new Date(invite.expires_at) < new Date()) {
          setError("This invitation has expired");
          setIsLoading(false);
          return;
        }

        // Get hub details
        const { data: hubData, error: hubError } = await supabase
          .from('hubs')
          .select('*')
          .eq('id', invite.hub_id)
          .maybeSingle();

        if (hubError || !hubData) {
          console.error('Error fetching hub:', hubError);
          setError("Hub not found");
          setIsLoading(false);
          return;
        }

        setInvitation(invite);
        setHub(hubData);
        setIsLoading(false);
      } catch (error: any) {
        console.error('Error in fetchInvitation:', error);
        setError("Failed to load invitation");
        setIsLoading(false);
      }
    };

    fetchInvitation();
  }, [token]);

  const handleResponse = async (accept: boolean) => {
    try {
      setIsProcessing(true);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // Validate invitation status again before processing
      const { data: invite, error: inviteError } = await supabase
        .from('hub_member_invites')
        .select('*')
        .eq('token', token)
        .eq('invited_email', user.email) // Fixed: Changed 'email' to 'invited_email'
        .maybeSingle();

      if (inviteError || !invite) {
        throw new Error("Invitation not found");
      }

      if (invite.status !== 'pending') {
        throw new Error("This invitation has already been processed");
      }

      if (new Date(invite.expires_at) < new Date()) {
        throw new Error("This invitation has expired");
      }

      const timestamp = new Date().toISOString();
      
      if (accept) {
        // Create hub member record
        const { error: memberError } = await supabase
          .from('hub_members')
          .insert({
            hub_id: invitation.hub_id,
            profile_id: user.id,
            role: invitation.role,
            status: 'Approved',
          });

        if (memberError) throw memberError;
      }

      // Update invitation status
      const { error: updateError } = await supabase
        .from('hub_member_invites')
        .update({
          status: accept ? 'accepted' : 'rejected',
          accepted_at: accept ? timestamp : null,
          rejected_at: accept ? null : timestamp,
        })
        .eq('token', token)
        .eq('invited_email', user.email); // Fixed: Changed 'email' to 'invited_email'

      if (updateError) throw updateError;

      // Log the audit event
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
