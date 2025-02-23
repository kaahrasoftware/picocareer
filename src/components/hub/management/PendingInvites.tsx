
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { X } from "lucide-react";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface PendingInvitesProps {
  hubId: string;
  pendingInvites: any[];
}

export function PendingInvites({ hubId, pendingInvites }: PendingInvitesProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Subscribe to real-time changes for pending invites
  useEffect(() => {
    const channel = supabase
      .channel('hub-invites')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'hub_member_invites',
          filter: `hub_id=eq.${hubId}`
        },
        (payload) => {
          console.log('Invite change received:', payload);
          // Invalidate and refetch the pending invites query
          queryClient.invalidateQueries({ queryKey: ['hub-pending-invites', hubId] });
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [hubId, queryClient]);

  const handleCancelInvite = async (inviteId: string) => {
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

  if (!pendingInvites?.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Invites</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pendingInvites.map((invite) => (
            <div key={invite.id} className="flex items-center justify-between p-2 border rounded">
              <div>
                <p className="font-medium">{invite.invited_email}</p>
                <p className="text-sm text-muted-foreground">Role: {invite.role}</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => handleCancelInvite(invite.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

