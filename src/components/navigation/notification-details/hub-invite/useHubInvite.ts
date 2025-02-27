
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function useHubInvite(token: string | null) {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAccept = async () => {
    if (!token) {
      toast({
        title: "Error",
        description: "Invalid invitation token",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('Accepting invitation with token:', token);
      
      // First get the invitation details to check status
      const { data: invite, error: inviteError } = await supabase
        .from('hub_member_invites')
        .select('*')
        .eq('token', token)
        .maybeSingle();
        
      if (inviteError) throw inviteError;
      
      if (!invite || invite.status !== 'pending') {
        toast({
          title: "Invalid invitation",
          description: "This invitation is no longer valid.",
          variant: "destructive"
        });
        return;
      }

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // First update the invite status
      const { error: updateError } = await supabase
        .from('hub_member_invites')
        .update({ 
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('token', token);
          
      if (updateError) throw updateError;

      // Then create the hub member record
      const { error: memberError } = await supabase
        .from('hub_members')
        .insert({
          hub_id: invite.hub_id,
          profile_id: user.id,
          role: invite.role,
          status: 'Approved'
        });

      if (memberError) throw memberError;

      // Log the audit event
      await supabase.rpc('log_hub_audit_event', {
        _hub_id: invite.hub_id,
        _action: 'member_added',
        _details: { role: invite.role }
      });

      toast({
        title: "Success",
        description: "You have successfully joined the hub.",
      });

      navigate(`/hubs/${invite.hub_id}`);
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to accept invitation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!token) {
      toast({
        title: "Error",
        description: "Invalid invitation token",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('Rejecting invitation with token:', token);
      
      // First check if invitation is still valid
      const { data: invite, error: inviteError } = await supabase
        .from('hub_member_invites')
        .select('*')
        .eq('token', token)
        .maybeSingle();
        
      if (inviteError) throw inviteError;
      
      if (!invite || invite.status !== 'pending') {
        toast({
          title: "Invalid invitation",
          description: "This invitation is no longer valid.",
          variant: "destructive"
        });
        return;
      }

      // Update the invite status
      const { error: updateError } = await supabase
        .from('hub_member_invites')
        .update({ 
          status: 'rejected',
          rejected_at: new Date().toISOString()
        })
        .eq('token', token);
          
      if (updateError) throw updateError;

      // Log the audit event
      await supabase.rpc('log_hub_audit_event', {
        _hub_id: invite.hub_id,
        _action: 'member_invitation_cancelled',
        _details: { role: invite.role }
      });
      
      toast({
        title: "Invitation Declined",
        description: "You have declined the hub invitation.",
      });

      navigate("/hubs");
    } catch (error: any) {
      console.error('Error rejecting invitation:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to reject invitation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleAccept,
    handleReject
  };
}
