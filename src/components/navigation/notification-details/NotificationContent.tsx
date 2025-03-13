
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertCircle, Calendar, CheckCircle, ExternalLink, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

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
  const isSessionReminder = type === 'session_reminder';
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
  
  const handleNavigateToUrl = () => {
    if (action_url) {
      // Mark notification as read when navigating
      if (notification_id) {
        supabase
          .from('notifications')
          .update({ read: true })
          .eq('id', notification_id);
      }
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
  
  // Get background color based on notification type
  const getBackgroundColor = () => {
    if (isSessionBooked || isSessionReminder) return "bg-blue-50 border-blue-200";
    if (isHubInvite) return "bg-amber-50 border-amber-200";
    if (isHubMembership) return "bg-emerald-50 border-emerald-200";
    return "bg-gray-50 border-gray-200";
  };
  
  // Get icon based on notification type
  const getNotificationIcon = () => {
    if (isSessionReminder || isSessionBooked) return <Calendar className="h-5 w-5 text-blue-500" />;
    if (isHubInvite) return <AlertCircle className="h-5 w-5 text-amber-500" />;
    if (isHubMembership) return <CheckCircle className="h-5 w-5 text-emerald-500" />;
    return null;
  };
  
  // Render appropriate content based on notification type
  if (isHubInvite) {
    return (
      <div className={cn("mt-2 text-sm text-gray-700 p-4 rounded-md border transition-all", getBackgroundColor())}>
        <div className="flex items-start gap-3">
          {getNotificationIcon()}
          <div className="flex-1">
            <p className={isExpanded ? "line-clamp-none" : "line-clamp-2"}>
              {message}
            </p>
            
            {errorMessage && (
              <div className="mt-2 p-2 text-xs text-red-600 bg-red-50 rounded-md border border-red-200">
                {errorMessage}
              </div>
            )}
            
            <div className="flex items-center flex-wrap gap-2 mt-3">
              {isProcessing ? (
                <div className="text-xs text-gray-500 py-1 px-3 bg-gray-100 rounded-full animate-pulse">
                  Processing...
                </div>
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
        </div>
      </div>
    );
  }
  
  // Hub membership notification
  if (isHubMembership) {
    return (
      <div className={cn("mt-2 text-sm text-gray-700 p-4 rounded-md border transition-all", getBackgroundColor())}>
        <div className="flex items-start gap-3">
          {getNotificationIcon()}
          <div className="flex-1">
            <p className={isExpanded ? "line-clamp-none" : "line-clamp-2"}>
              {message}
            </p>
            
            <div className="flex items-center space-x-2 mt-3">
              <Button 
                size="sm"
                onClick={handleHubMembershipClick}
                className="flex items-center"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                View Hub
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Session notifications
  if (isSessionReminder || isSessionBooked) {
    return (
      <div className={cn("mt-2 text-sm text-gray-700 p-4 rounded-md border transition-all", getBackgroundColor())}>
        <div className="flex items-start gap-3">
          {getNotificationIcon()}
          <div className="flex-1">
            <p className={isExpanded ? "line-clamp-none" : "line-clamp-2"}>
              {message}
            </p>
            
            {action_url && (
              <div className="flex items-center space-x-2 mt-3">
                <Button 
                  size="sm"
                  onClick={handleNavigateToUrl}
                  className="flex items-center"
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  View Calendar
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // Default content for other notification types
  return (
    <div className={cn("mt-2 text-sm text-gray-700 p-4 rounded-md border transition-all", getBackgroundColor())}>
      {getNotificationIcon() && (
        <div className="flex items-start gap-3">
          {getNotificationIcon()}
          <div className="flex-1">
            <p className={isExpanded ? "line-clamp-none" : "line-clamp-2"}>
              {message}
            </p>
            
            {action_url && (
              <div className="flex items-center space-x-2 mt-3">
                <Button 
                  size="sm"
                  variant="secondary"
                  onClick={handleNavigateToUrl}
                  className="flex items-center"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View Details
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {!getNotificationIcon() && (
        <p className={isExpanded ? "line-clamp-none" : "line-clamp-2"}>
          {message}
        </p>
      )}
    </div>
  );
}
