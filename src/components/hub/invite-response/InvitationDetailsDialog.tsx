
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { HubInvite, Hub } from "@/hooks/hub/types/invitation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "./LoadingSpinner";

interface InvitationDetailsDialogProps {
  invitation: HubInvite;
  hub: Hub;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InvitationDetailsDialog({
  invitation,
  hub,
  isOpen,
  onOpenChange,
}: InvitationDetailsDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasRejected, setHasRejected] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleInvitationResponse = async (accept: boolean) => {
    setIsProcessing(true);
    
    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error("Please sign in to respond to this invitation");
      }
      
      // Verify the invitation is still valid
      const { data: currentInvite, error: inviteError } = await supabase
        .from('hub_member_invites')
        .select('*')
        .eq('token', invitation.token)
        .eq('invited_email', user.email)
        .single();
        
      if (inviteError || !currentInvite) {
        throw new Error("Invitation not found or has been processed");
      }
      
      if (currentInvite.status !== 'pending') {
        throw new Error("This invitation has already been processed");
      }
      
      const timestamp = new Date().toISOString();
      
      // If accepting, create hub member record
      if (accept) {
        const { error: memberError } = await supabase
          .from('hub_members')
          .insert({
            hub_id: invitation.hub_id,
            profile_id: user.id,
            role: invitation.role,
            status: 'Approved',
          });
          
        if (memberError) {
          console.error("Error creating member record:", memberError);
          throw memberError;
        }
      } else {
        // If rejecting, mark as rejected
        setHasRejected(true);
      }
      
      // Update invitation status
      const { error: updateError } = await supabase
        .from('hub_member_invites')
        .update({
          status: accept ? 'accepted' : 'rejected',
          accepted_at: accept ? timestamp : null,
          rejected_at: accept ? null : timestamp,
        })
        .eq('token', invitation.token)
        .eq('invited_email', user.email);
        
      if (updateError) {
        console.error("Error updating invitation status:", updateError);
        throw updateError;
      }
      
      // Log the audit event
      await supabase.rpc('log_hub_audit_event', {
        _hub_id: invitation.hub_id,
        _action: accept ? 'member_added' : 'member_invitation_cancelled',
        _details: { role: invitation.role }
      });
      
      // Show success message
      toast({
        title: accept ? "Invitation Accepted" : "Invitation Declined",
        description: accept
          ? `You are now a member of ${hub.name}`
          : `You have declined the invitation to join ${hub.name}`,
      });
      
      // Navigate to appropriate page
      if (accept) {
        navigate(`/hubs/${hub.id}`);
      } else {
        navigate("/hubs");
      }
      
    } catch (error: any) {
      console.error("Error processing invitation response:", error);
      
      toast({
        title: "Error",
        description: error.message || "Failed to process invitation",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invitation to Join {hub.name}</DialogTitle>
          <DialogDescription>
            You've been invited to join as a <span className="font-medium">{invitation.role}</span>
          </DialogDescription>
        </DialogHeader>
        
        {hub.description && (
          <div className="py-4">
            <h4 className="text-sm font-medium mb-2">About this Hub</h4>
            <p className="text-sm text-muted-foreground">{hub.description}</p>
          </div>
        )}
        
        {isProcessing ? (
          <div className="flex justify-center py-4">
            <LoadingSpinner />
            <span className="ml-2">Processing your response...</span>
          </div>
        ) : (
          <DialogFooter className="flex sm:justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleInvitationResponse(false)}
              disabled={isProcessing}
            >
              Decline
            </Button>
            <Button
              type="button"
              onClick={() => handleInvitationResponse(true)}
              disabled={isProcessing || hasRejected}
            >
              Accept &amp; Join
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
