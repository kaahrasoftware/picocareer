
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Calendar, Clock, User, Link as LinkIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { formatInTimeZone } from "date-fns-tz";

export function NotificationContent({
  message,
  isExpanded,
  type,
  action_url,
  notification_id,
  metadata
}: {
  message: string;
  isExpanded: boolean;
  type?: string;
  action_url?: string;
  notification_id?: string;
  metadata?: any;
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
  
  // Session notification content
  if (isSessionBooked && metadata) {
    const { mentorName, menteeName, sessionType, startTime, duration, platform, meetingLink } = metadata;
    const formattedTime = startTime ? formatInTimeZone(
      new Date(startTime),
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      'PPP p'
    ) : 'Time not specified';
    
    return (
      <div className="mt-1 text-sm text-gray-600 bg-gray-50 p-4 rounded-md border border-gray-200">
        <p className={`mb-3 font-medium text-gray-800 ${isExpanded ? "line-clamp-none" : "line-clamp-2"}`}>
          {message}
        </p>
        
        <div className="space-y-3 bg-white p-3 rounded border border-gray-100">
          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <p className="text-gray-700">{formattedTime}</p>
          </div>
          
          <div className="flex items-start gap-2">
            <Clock className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <p className="text-gray-700">{duration} minutes</p>
          </div>
          
          <div className="flex items-start gap-2">
            <User className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-gray-700"><span className="font-medium">Mentor:</span> {mentorName}</p>
              <p className="text-gray-700"><span className="font-medium">Mentee:</span> {menteeName}</p>
            </div>
          </div>
          
          {sessionType && (
            <div className="flex items-start gap-2">
              <div className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <p className="text-gray-700"><span className="font-medium">Type:</span> {sessionType}</p>
            </div>
          )}
          
          {platform && (
            <div className="flex items-start gap-2">
              <div className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <p className="text-gray-700"><span className="font-medium">Platform:</span> {platform}</p>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2 mt-3">
          <Button 
            size="sm"
            onClick={() => action_url && navigate(action_url)}
            variant="outline"
            className="flex items-center"
          >
            <Calendar className="h-4 w-4 mr-1" />
            View Session
          </Button>
          
          {meetingLink && (
            <Button 
              size="sm"
              onClick={() => window.open(meetingLink, '_blank')}
              className="flex items-center"
            >
              <LinkIcon className="h-4 w-4 mr-1" />
              Join Meeting
            </Button>
          )}
        </div>
      </div>
    );
  }
  
  // Render appropriate content based on notification type
  if (isHubInvite) {
    return (
      <div className="mt-1 text-sm text-gray-600 bg-gray-50 p-3 rounded-md border border-gray-200">
        <p className={isExpanded ? "line-clamp-none" : "line-clamp-2"}>
          {message}
        </p>
        
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
        <p className={isExpanded ? "line-clamp-none" : "line-clamp-2"}>
          {message}
        </p>
        
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
  
  // Default content for other notification types
  return (
    <p className={`mt-1 text-sm text-gray-600 bg-gray-50 p-2 rounded-md ${isExpanded ? "line-clamp-none" : "line-clamp-2"}`}>
      {message}
    </p>
  );
}
