
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "./LoadingSpinner";
import type { HubInvite, Hub } from "@/hooks/hub/types/invitation";

interface NotificationBasedInviteListProps {
  invitations: Array<HubInvite & { hub: Hub }>;
}

export function NotificationBasedInviteList({ invitations }: NotificationBasedInviteListProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleInvitationResponse = async (invitation: HubInvite & { hub: Hub }, accept: boolean) => {
    setProcessingId(invitation.id);
    
    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error("Please sign in to respond to this invitation");
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
      }
      
      // Update invitation status
      const { error: updateError } = await supabase
        .from('hub_member_invites')
        .update({
          status: accept ? 'accepted' : 'rejected',
          accepted_at: accept ? timestamp : null,
          rejected_at: accept ? null : timestamp,
        })
        .eq('id', invitation.id);
        
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
          ? `You are now a member of ${invitation.hub.name}`
          : `You have declined the invitation to join ${invitation.hub.name}`,
      });
      
      // Navigate to appropriate page
      if (accept) {
        navigate(`/hubs/${invitation.hub.id}`);
      } else {
        // Remove this invitation from the list in the parent component
        // For simplicity, we'll just refresh the page
        window.location.reload();
      }
      
    } catch (error: any) {
      console.error("Error processing invitation response:", error);
      
      toast({
        title: "Error",
        description: error.message || "Failed to process invitation",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Pending Hub Invitations</CardTitle>
          <CardDescription>
            You have been invited to join the following hubs. Accept or decline the invitations below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {invitations.map((invitation) => (
              <Card key={invitation.id} className="overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                  {invitation.hub.logo_url && (
                    <div className="w-full sm:w-24 h-24 bg-muted flex items-center justify-center p-2">
                      <img 
                        src={invitation.hub.logo_url} 
                        alt={invitation.hub.name} 
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  )}
                  <div className="p-4 flex-1">
                    <h3 className="text-lg font-semibold mb-1">{invitation.hub.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">Role: {invitation.role}</p>
                    {invitation.hub.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {invitation.hub.description}
                      </p>
                    )}
                    <div className="flex justify-end gap-3 mt-2">
                      {processingId === invitation.id ? (
                        <div className="flex items-center justify-center p-2">
                          <LoadingSpinner />
                          <span className="ml-2">Processing...</span>
                        </div>
                      ) : (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleInvitationResponse(invitation, false)}
                            disabled={!!processingId}
                            className="flex items-center"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Decline
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleInvitationResponse(invitation, true)}
                            disabled={!!processingId}
                            className="flex items-center"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Accept
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
