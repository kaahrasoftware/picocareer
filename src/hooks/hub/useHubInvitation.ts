
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

        const { data: invite, error: inviteError } = await supabase
          .from('hub_member_invites')
          .select('*')
          .eq('token', token)
          .maybeSingle();

        if (inviteError || !invite) {
          setError("Invitation not found");
          setIsLoading(false);
          return;
        }

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

        const { data: hubData, error: hubError } = await supabase
          .from('hubs')
          .select('*')
          .eq('id', invite.hub_id)
          .maybeSingle();

        if (hubError || !hubData) {
          setError("Hub not found");
          setIsLoading(false);
          return;
        }

        setInvitation(invite);
        setHub(hubData);
        setIsLoading(false);
      } catch (error: any) {
        console.error('Error fetching invitation:', error);
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
        .eq('token', token);

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
        description: "Failed to process invitation. Please try again.",
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
