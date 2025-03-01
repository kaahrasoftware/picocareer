import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Calendar, Clock, UserCheck, Tag, Link, ExternalLink } from "lucide-react";
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
  
  const isHubInvite = type === 'hub_invite';
  const isHubMembership = type === 'hub_membership';
  const isSessionNotification = type === 'session_booked' || type === 'session_reminder' || type === 'session_cancelled';
  
  const extractHubId = (url?: string): string | null => {
    if (!url) return null;
    
    const pathMatch = url.match(/\/hubs\/([^/?&]+)/);
    if (pathMatch && pathMatch[1]) return pathMatch[1];
    
    return null;
  };
  
  const handleHubMembershipClick = () => {
    if (action_url) {
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
        console.error("Could not fetch user profile:", profileError);
        throw new Error("Could not verify your account information");
      }
      
      console.log("User email:", userProfile.email);
      
      let hubId = null;
      let invitationId = null;
      let hubName = "the hub";
      let inviteData = null;
      let inviteToken = null;
      
      if (action_url) {
        hubId = extractHubId(action_url);
        console.log("Extracted hub ID:", hubId);
      }
      
      if (!hubId) {
        throw new Error("Could not determine which hub this invitation is for");
      }
      
      const timestamp = new Date().toISOString();
      
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
      
      if (notification_id) {
        await supabase
          .from('notifications')
          .update({ read: true })
          .eq('id', notification_id);
      }
      
      const { data: hubData } = await supabase
        .from('hubs')
        .select('name')
        .eq('id', hubId)
        .single();
        
      hubName = hubData?.name || "the hub";
      
      toast({
        title: accept ? "Invitation Accepted" : "Invitation Declined",
        description: accept 
          ? `You have successfully joined ${hubName}` 
          : `You have declined the invitation to join ${hubName}`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['hub-members', hubId] });
      
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

  const renderHTML = (content: string) => {
    return { __html: content };
  };
  
  const extractMeetingLink = (message: string): string | null => {
    const meetingLinkMatch = message.match(/(?:meeting|meet) link[:\s]+([^\s<]+)/i);
    if (meetingLinkMatch && meetingLinkMatch[1]) {
      return meetingLinkMatch[1];
    }
    
    if (message.includes('href="')) {
      const hrefMatch = message.match(/href="([^"]+)"/);
      if (hrefMatch && hrefMatch[1]) {
        return hrefMatch[1];
      }
    }
    
    return null;
  };
  
  const formatSessionMessage = (message: string) => {
    if (message.includes('<') && message.includes('>')) {
      return (
        <div 
          className="prose prose-sm max-w-none text-gray-600"
          dangerouslySetInnerHTML={renderHTML(message)}
        />
      );
    }
    
    const dateMatch = message.match(/scheduled for ([^,]+),/);
    const timeMatch = message.match(/at (\d+:\d+\s*[AP]M)/i);
    const mentorMatch = message.match(/with ([^\.]+)/);
    const sessionTypeMatch = message.match(/for a ([^\.]+) session/);
    const durationMatch = message.match(/(\d+) minute/);
    const meetingPlatformMatch = message.match(/via ([^\s\.]+)/);
    
    if (dateMatch || timeMatch || mentorMatch || sessionTypeMatch) {
      return (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">{message}</p>
          
          <div className="grid grid-cols-1 gap-2 bg-gray-50 p-4 rounded-md border border-gray-200 mt-2">
            {dateMatch && (
              <div className="flex gap-2 items-center">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-gray-500">Date:</span>
                <span className="text-xs text-gray-700 font-semibold">{dateMatch[1]}</span>
              </div>
            )}
            
            {timeMatch && (
              <div className="flex gap-2 items-center">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-gray-500">Time:</span>
                <span className="text-xs text-gray-700 font-semibold">{timeMatch[1]}</span>
              </div>
            )}
            
            {durationMatch && (
              <div className="flex gap-2 items-center">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-gray-500">Duration:</span>
                <span className="text-xs text-gray-700 font-semibold">{durationMatch[1]} minutes</span>
              </div>
            )}
            
            {sessionTypeMatch && (
              <div className="flex gap-2 items-center">
                <Tag className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-gray-500">Type:</span>
                <span className="text-xs text-gray-700 font-semibold">{sessionTypeMatch[1]}</span>
              </div>
            )}
            
            {mentorMatch && (
              <div className="flex gap-2 items-center">
                <UserCheck className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-gray-500">With:</span>
                <span className="text-xs text-gray-700 font-semibold">{mentorMatch[1]}</span>
              </div>
            )}
            
            {meetingPlatformMatch && (
              <div className="flex gap-2 items-center">
                <Link className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-gray-500">Platform:</span>
                <span className="text-xs text-gray-700 font-semibold">{meetingPlatformMatch[1]}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return <p className="text-sm text-gray-600">{message}</p>;
  };
  
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

  if (isSessionNotification) {
    const meetingLink = extractMeetingLink(message);
    
    return (
      <div className="mt-1 bg-gray-50 p-3 rounded-md border border-gray-200">
        {formatSessionMessage(message)}
        
        <div className="flex items-center space-x-2 mt-3">
          {action_url && (
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
              <Calendar className="h-4 w-4 mr-1" />
              View Session
            </Button>
          )}
          
          {meetingLink && (
            <Button 
              size="sm"
              variant="default"
              onClick={() => {
                if (notification_id) {
                  supabase
                    .from('notifications')
                    .update({ read: true })
                    .eq('id', notification_id);
                }
                window.open(meetingLink, '_blank', 'noopener,noreferrer');
              }}
              className="flex items-center bg-green-600 hover:bg-green-700"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Join Meeting
            </Button>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className="mt-1 bg-gray-50 p-3 rounded-md border border-gray-200">
      <div 
        className={`text-sm text-gray-600 prose prose-sm max-w-none ${isExpanded ? "line-clamp-none" : "line-clamp-2"}`}
        dangerouslySetInnerHTML={renderHTML(message)}
      />
    </div>
  );
}
