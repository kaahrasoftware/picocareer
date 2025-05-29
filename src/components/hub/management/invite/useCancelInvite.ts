
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function useCancelInvite(hubId: string) {
  const { toast } = useToast();

  const cancelInvite = async (inviteId: string) => {
    try {
      const { error } = await supabase
        .from('hub_member_invites')
        .delete()
        .eq('id', inviteId);

      if (error) throw error;

      // Log the audit event
      await supabase.rpc('log_hub_audit_event', {
        _hub_id: hubId,
        _action: 'member_invitation_cancelled',
        _details: { invite_id: inviteId }
      });

      toast({
        title: "Invitation cancelled",
        description: "The invitation has been cancelled",
      });
    } catch (error) {
      console.error('Error cancelling invite:', error);
      toast({
        title: "Error",
        description: "Failed to cancel invitation. Please try again.",
        variant: "destructive",
      });
    }
  };

  return { cancelInvite };
}
