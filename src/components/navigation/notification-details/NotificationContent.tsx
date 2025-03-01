
import { useState } from "react";
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Helper function to determine notification type
  const isHubInvite = type === 'hub_invite';
  const isHubMembership = type === 'hub_membership';
  const isSessionBooked = type === 'session_booked';
  
  const extractHubId = (url?: string): string | null => {
    if (!url) return null;
    
    // Extract hub ID from URL (e.g. /hubs/[uuid])
    const pathMatch = url.match(/\/hubs\/([^/?&]+)/);
    if (pathMatch && pathMatch[1]) return pathMatch[1];
    
    return null;
  };
  
  const handleHubMembershipClick = () => {
    if (action_url) {
      // Mark notification as read
      if (notification_id) {
        supabase
          .from('notifications')
          .update({ read: true })
          .eq('id', notification_id);
      }
      
      // Navigate to the hub page
      navigate(action_url);
    }
  };
  
  const handleInvitationResponse = async (accept: boolean) => {
    try {
      setIsProcessing(true);
      setErrorMessage(null);
      
      console.log("Starting invitation response process", { accept, notification_id, action_url });
      
      // Get the current user first to validate authentication
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
      
      let hubId = null;
      let invitationId = null;
      let hubName = "the hub";
      let inviteData = null;
      let inviteToken = null;
      
      // Extract hubId from action_url if present
      if (action_url) {
        hubId = extractHubId(action_url);
        console.log("Extracted hub ID:", hubId);
      }
      
      if (!hubId) {
        throw new Error("Could not determine which hub this invitation is for");
      }
      
      const timestamp = new Date().toISOString();
      
      // If accepting, create hub member record
      if (accept) {
        const { error: memberError } = await supabase
          .from('hub_members')
          .insert({
            hub_id: hubId,
            profile_id: user.id,
            role: 'member',
            status: 'Approved',
          });
          
        if (memberError) {
          console.error("Error creating member record:", memberError);
          throw memberError;
        }
      }
      
      // If there's a notification, mark it as read
      if (notification_id) {
        await supabase
          .from('notifications')
          .update({ read: true })
          .eq('id', notification_id);
      }
      
      // Get hub name
      const { data: hubData } = await supabase
        .from('hubs')
        .select('name')
        .eq('id', hubId)
        .single();
        
      hubName = hubData?.name || "the hub";
      
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
      setErrorMessage(error.message || "Failed to process invitation");
      
      toast({
        title: "Error",
        description: error.message || "Failed to process invitation",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Function to safely render HTML content
  const renderHtmlContent = (content: string) => {
    return { __html: content };
  };
  
  // Render appropriate content based on notification type
  if (isHubInvite) {
    return (
      <div className="mt-1 text-sm text-gray-600 bg-gray-50 p-3 rounded-md border border-gray-200">
        <div 
          className={isExpanded ? "line-clamp-none" : "line-clamp-2"}
          dangerouslySetInnerHTML={renderHtmlContent(message)}
        />
        
        {errorMessage && (
          <div className="mt-2 p-2 text-xs text-red-500 bg-red-50 rounded-md">
            {errorMessage}
          </div>
        )}
        
        <div className="flex items-center space-x-2 mt-3">
          {isProcessing ? (
            <div className="text-xs text-gray-500">Processing...</div>
          ) : (
            <>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleInvitationResponse(false)}
                className="flex items-center bg-white hover:bg-gray-100"
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
  
  // Hub membership notification
  if (isHubMembership) {
    return (
      <div className="mt-1 text-sm text-gray-600 bg-gray-50 p-3 rounded-md border border-gray-200">
        <div 
          className={isExpanded ? "line-clamp-none" : "line-clamp-2"}
          dangerouslySetInnerHTML={renderHtmlContent(message)}
        />
        
        <div className="flex items-center space-x-2 mt-3">
          <Button 
            size="sm"
            onClick={handleHubMembershipClick}
            className="flex items-center"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            View Hub
          </Button>
        </div>
      </div>
    );
  }
  
  // Session booked notification with HTML content
  if (isSessionBooked) {
    return (
      <div className="mt-1 text-sm text-gray-600 bg-gray-50 p-3 rounded-md border border-gray-200">
        <div 
          className={`prose prose-sm max-w-none ${isExpanded ? "line-clamp-none" : "line-clamp-2"}`}
          dangerouslySetInnerHTML={renderHtmlContent(message)}
        />
        
        {action_url && (
          <div className="flex items-center space-x-2 mt-3">
            <Button 
              size="sm"
              onClick={() => {
                if (notification_id) {
                  supabase
                    .from('notifications')
                    .update({ read: true })
                    .eq('id', notification_id);
                }
                navigate(action_url);
              }}
              className="flex items-center"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              View Details
            </Button>
          </div>
        )}
      </div>
    );
  }
  
  // Default content for other notification types
  return (
    <div className={`mt-1 text-sm text-gray-600 bg-gray-50 p-2 rounded-md ${isExpanded ? "line-clamp-none" : "line-clamp-2"}`}>
      <div 
        className="prose prose-sm max-w-none"
        dangerouslySetInnerHTML={renderHtmlContent(message)}
      />
    </div>
  );
}

