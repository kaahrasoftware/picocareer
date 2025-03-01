
import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export function NotificationContent({
  message,
  isExpanded,
  type,
  action_url,
  notification_id,
}: {
  message: string;
  isExpanded: boolean;
  type?: string;
  action_url?: string;
  notification_id?: string;
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Helper function to determine if this is a hub invitation
  const isHubInvite = type === 'hub_invite';
  
  const handleInvitationResponse = async (accept: boolean) => {
    if (!notification_id) return;
    
    setIsProcessing(true);
    
    try {
      // Get the notification details first to find the related invitation
      const { data: notificationData, error: notificationError } = await supabase
        .from('notifications')
        .select('*')
        .eq('id', notification_id)
        .single();
      
      if (notificationError) {
        throw new Error(`Failed to fetch notification details: ${notificationError.message}`);
      }
      
      if (!notificationData || !notificationData.action_url) {
        throw new Error("Notification does not contain needed information");
      }
      
      console.log("Notification data:", notificationData);
      
      // Extract hub invitation ID from the action_url
      let inviteToken = null;
      
      if (notificationData.action_url.includes('token=')) {
        const tokenMatch = notificationData.action_url.match(/token=([^&]+)/);
        if (tokenMatch && tokenMatch[1]) {
          inviteToken = tokenMatch[1];
        }
      } else if (notificationData.action_url.includes('/hub-invite/')) {
        const pathParts = notificationData.action_url.split('/');
        inviteToken = pathParts[pathParts.length - 1];
      }
      
      if (!inviteToken) {
        try {
          const url = new URL(notificationData.action_url);
          inviteToken = url.searchParams.get('token');
        } catch (parseError) {
          console.error("URL parsing error:", parseError);
        }
      }
      
      console.log("Extracted invitation token:", inviteToken);
      
      if (!inviteToken) {
        throw new Error("Could not extract invitation token from notification");
      }
      
      // Get the hub invitation details
      const { data: inviteData, error: inviteError } = await supabase
        .from('hub_member_invites')
        .select('*, hub:hubs(id, name)')
        .eq('token', inviteToken)
        .maybeSingle();
      
      console.log("Invite data:", inviteData);
      console.log("Invite error:", inviteError);
      
      if (inviteError) {
        throw new Error(`Database error: ${inviteError.message}`);
      }
      
      if (!inviteData) {
        // Try to find the invitation by checking all pending invitations for the user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          throw new Error("Please sign in to respond to this invitation");
        }
        
        const { data: userProfile, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', user.id)
          .single();
        
        if (profileError || !userProfile) {
          throw new Error("Could not fetch user profile");
        }
        
        console.log("User email:", userProfile.email);
        
        // Find invitation for this user's email
        const { data: userInvites, error: userInvitesError } = await supabase
          .from('hub_member_invites')
          .select('*, hub:hubs(id, name)')
          .eq('invited_email', userProfile.email)
          .eq('status', 'pending');
        
        console.log("User's pending invites:", userInvites);
        
        if (userInvitesError) {
          throw new Error(`Error fetching user invitations: ${userInvitesError.message}`);
        }
        
        if (!userInvites || userInvites.length === 0) {
          throw new Error("No pending invitations found for your account");
        }
        
        // Use the most recent invitation if multiple are found
        const mostRecentInvite = userInvites.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0];
        
        console.log("Using most recent invite:", mostRecentInvite);
        
        // Set the invite data to the found invitation
        if (mostRecentInvite) {
          inviteData = mostRecentInvite;
        } else {
          throw new Error("Could not find invitation details");
        }
      }
      
      const hubId = inviteData.hub_id;
      const invitationId = inviteData.id;
      const hubName = inviteData.hub?.name || "the hub";
      
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
            hub_id: hubId,
            profile_id: user.id,
            role: inviteData.role || 'member',
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
        .eq('id', invitationId);
        
      if (updateError) {
        console.error("Error updating invitation status:", updateError);
        throw updateError;
      }
      
      // Mark notification as read
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notification_id);
      
      // Log the audit event
      await supabase.rpc('log_hub_audit_event', {
        _hub_id: hubId,
        _action: accept ? 'member_added' : 'member_invitation_cancelled',
        _details: { role: inviteData.role || 'member' }
      });
      
      // Show success message
      toast({
        title: accept ? "Invitation Accepted" : "Invitation Declined",
        description: accept 
          ? `You have successfully joined ${hubName}` 
          : `You have declined the invitation to join ${hubName}`,
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      
      // Navigate to appropriate page
      if (accept) {
        navigate(`/hubs/${hubId}`);
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
  
  // Render appropriate content based on notification type
  if (isHubInvite) {
    return (
      <div className="mt-1 text-sm text-muted-foreground">
        <p className={isExpanded ? "line-clamp-none" : "line-clamp-2"}>
          {message}
        </p>
        <div className="flex items-center space-x-2 mt-3">
          {isProcessing ? (
            <div className="text-xs">Processing...</div>
          ) : (
            <>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleInvitationResponse(false)}
                className="flex items-center"
              >
                <XCircle className="h-4 w-4 mr-1" />
                Decline
              </Button>
              <Button 
                size="sm"
                onClick={() => handleInvitationResponse(true)}
                className="flex items-center"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Accept
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }
  
  // Default content for other notification types
  return (
    <p className={`mt-1 text-sm text-muted-foreground ${isExpanded ? "line-clamp-none" : "line-clamp-2"}`}>
      {message}
    </p>
  );
}
