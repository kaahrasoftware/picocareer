
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNotificationData } from "./hooks/useNotificationData";
import { NotificationDialogs } from "./NotificationDialogs";
import { SessionNotificationContent } from "./SessionNotificationContent";
import type { MentorSession } from "@/types/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface NotificationContentProps {
  message: string;
  isExpanded: boolean;
  type?: string;
  action_url?: string;
}

export function NotificationContent({ 
  message, 
  isExpanded, 
  type, 
  action_url 
}: NotificationContentProps) {
  // Move all hooks to the top
  const [sessionData, setSessionData] = useState<MentorSession | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Extract ID from action URL
  const contentId = action_url?.split('/').pop();

  // Fetch data using custom hook
  const { majorData, careerData, blogData } = useNotificationData(contentId, type, dialogOpen);

  useEffect(() => {
    if (!isExpanded) return;

    const fetchSessionData = async () => {
      setIsLoading(true);
      
      try {
        const meetingLinkMatch = message.match(/href="([^"]+)"/);
        if (meetingLinkMatch) {
          const { data, error } = await supabase
            .from('mentor_sessions')
            .select(`
              id,
              scheduled_at,
              notes,
              meeting_platform,
              meeting_link,
              session_type:mentor_session_types(type, duration),
              mentor:profiles!mentor_sessions_mentor_id_fkey(full_name),
              mentee:profiles!mentor_sessions_mentee_id_fkey(full_name)
            `)
            .eq('meeting_link', meetingLinkMatch[1])
            .maybeSingle();

          if (error) {
            console.error('Error fetching session data:', error);
            throw error;
          }

          if (data) {
            setSessionData(data as MentorSession);
          }
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionData();
  }, [isExpanded, message]);

  const handleAccept = async () => {
    if (type === 'hub_invite' && action_url) {
      try {
        const url = new URL(action_url);
        const token = url.searchParams.get('token');
        if (token) {
          // First update the invite status to accepted
          const { error: updateError } = await supabase
            .from('hub_member_invites')
            .update({ status: 'accepted' })
            .eq('token', token);
            
          if (updateError) throw updateError;
          
          navigate(`/hub-invite?token=${token}&action=accept`);
          return;
        }
      } catch (error) {
        console.error('Error accepting invitation:', error);
        toast({
          title: "Error",
          description: "Failed to accept invitation. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const handleReject = async () => {
    if (type === 'hub_invite' && action_url) {
      try {
        const url = new URL(action_url);
        const token = url.searchParams.get('token');
        if (token) {
          // First update the invite status to rejected
          const { error: updateError } = await supabase
            .from('hub_member_invites')
            .update({ status: 'rejected' })
            .eq('token', token);
            
          if (updateError) throw updateError;
          
          navigate(`/hub-invite?token=${token}&action=reject`);
          return;
        }
      } catch (error) {
        console.error('Error rejecting invitation:', error);
        toast({
          title: "Error",
          description: "Failed to reject invitation. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  // Render functions for different states
  const renderNotExpanded = () => (
    <p className="text-sm text-zinc-400 mt-1 line-clamp-2">
      {message.split(/[.!?]/)[0]}
    </p>
  );

  const renderLoading = () => (
    <div className="space-y-2 mt-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );

  const renderSessionContent = () => (
    <div className="space-y-2 mt-3">
      <SessionNotificationContent sessionData={sessionData} />
    </div>
  );

  const renderHubInvite = () => (
    <div className="space-y-2 mt-3 text-sm text-zinc-400">
      <p>{message}</p>
      <div className="flex gap-2 mt-2">
        <Button
          variant="outline"
          size="sm"
          className="text-green-500 hover:text-green-400 hover:bg-green-500/10"
          onClick={handleAccept}
        >
          <Check className="w-4 h-4 mr-2" />
          Accept
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
          onClick={handleReject}
        >
          <X className="w-4 h-4 mr-2" />
          Reject
        </Button>
      </div>
    </div>
  );

  const renderDefaultContent = () => (
    <div className="space-y-2 mt-3 text-sm text-zinc-400">
      <p>{message}</p>
      {action_url && !type?.includes('session') && (
        <Button
          variant="outline"
          size="sm"
          className="mt-2 text-sky-400 hover:text-sky-300 hover:bg-sky-400/10"
          onClick={() => setDialogOpen(true)}
        >
          View Detail
          <ExternalLink className="w-4 h-4 ml-2" />
        </Button>
      )}
      <NotificationDialogs
        type={type}
        contentId={contentId!}
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        majorData={majorData}
        careerData={careerData}
        blogData={blogData}
      />
    </div>
  );

  // Main render logic
  if (!isExpanded) {
    return renderNotExpanded();
  }

  if (isLoading) {
    return renderLoading();
  }

  if (sessionData) {
    return renderSessionContent();
  }

  if (type === 'hub_invite') {
    return renderHubInvite();
  }

  return renderDefaultContent();
}
