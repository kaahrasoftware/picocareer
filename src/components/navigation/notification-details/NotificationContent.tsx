
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
    try {
      setIsProcessing(true);
      
      console.log("Starting invitation response process", { accept, notification_id, action_url });
      
      let hubId = null;
      let invitationId = null;
      let hubName = "the hub";
      let inviteToken = null;
      let foundViaNotification = false;
      
      // First try to get invitation details from notification
      if (notification_id) {
        console.log("Getting invitation details from notification");
        const { data: notificationData, error: notificationError } = await supabase
          .from('notifications')
          .select('*')
          .eq('id', notification_id)
          .single();
        
        if (notificationError) {
          console.error("Failed to fetch notification details:", notificationError);
          console.log("Will attempt to find invitation by email instead");
        } else if (notificationData && notificationData.action_url) {
          console.log("Notification data found:", notificationData);
          foundViaNotification = true;
          
          // Extract invitation token from the action_url
          if (notificationData.action_url.includes('token=')) {
            // URL format: /hub-invite?token=xxx
            const tokenMatch = notificationData.action_url.match(/token=([^&]+)/);
            if (tokenMatch && tokenMatch[1]) {
              inviteToken = tokenMatch[1];
            }
          } else if (notificationData.action_url.includes('/hub-invite/')) {
            // URL format: /hub-invite/xxx
            const pathParts = notificationData.action_url.split('/');
            inviteToken = pathParts[pathParts.length - 1];
          }
          
          if (!inviteToken) {
            try {
              // Parse the URL if it's a full URL
              const url = new URL(notificationData.action_url, window.location.origin);
              inviteToken = url.searchParams.get('token');
            } catch (parseError) {
              console.error("URL parsing error:", parseError);
            }
          }
          
          console.log("Extracted invitation token:", inviteToken);
        }
      }
      
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error("Please sign in to respond to this invitation");
      }
      
      // Get user's email
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', user.id)
        .single();
      
      if (profileError || !userProfile) {
        console.error("Could not fetch user profile:", profileError);
        throw new Error("Could not verify your account information");
      }
      
      console.log("User email:", userProfile.email);
      
      // If we have a token, use it to find the invitation
      let inviteData = null;
      if (inviteToken) {
        console.log("Finding invitation by token:", inviteToken);
        const { data, error: inviteError } = await supabase
          .from('hub_member_invites')
          .select('*, hub:hubs(id, name)')
          .eq('token', inviteToken)
          .maybeSingle();
          
        if (inviteError) {
          console.error("Error fetching invitation by token:", inviteError);
        } else if (data) {
          inviteData = data;
          console.log("Found invitation by token:", inviteData);
        }
      }
      
      // If we couldn't find the invitation by token, try to find by user email
      if (!inviteData) {
        console.log("Token-based lookup failed or wasn't attempted, trying email-based lookup");
        
        // Find pending invitation for this user's email
        const { data: userInvites, error: userInvitesError } = await supabase
          .from('hub_member_invites')
          .select('*, hub:hubs(id, name)')
          .eq('invited_email', userProfile.email)
          .eq('status', 'pending');
        
        console.log("User's pending invites:", userInvites);
        
        if (userInvitesError) {
          console.error("Error fetching user invitations:", userInvitesError);
          throw new Error(`Error fetching your invitations: ${userInvitesError.message}`);
        }
        
        if (!userInvites || userInvites.length === 0) {
          throw new Error("No pending invitations found for your account");
        }
        
        // Use the most recent invitation if multiple are found
        const mostRecentInvite = userInvites.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0];
        
        console.log("Using most recent invite:", mostRecentInvite);
        inviteData = mostRecentInvite;
      }
      
      if (!inviteData) {
        throw new Error("Could not find invitation details. Please contact hub administrator.");
      }
      
      hubId = inviteData.hub_id;
      invitationId = inviteData.id;
      hubName = inviteData.hub?.name || "the hub";
      
      console.log("Processing invitation response", { 
        hubId, 
        invitationId, 
        hubName, 
        accept,
        foundViaNotification
      });
      
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
      
      // If there's a notification, mark it as read
      if (notification_id) {
        await supabase
          .from('notifications')
          .update({ read: true })
          .eq('id', notification_id);
      }
      
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
      queryClient.invalidateQueries({ queryKey: ['hub-members', hubId] });
      
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
