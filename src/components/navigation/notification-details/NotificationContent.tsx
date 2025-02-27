
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useNotificationData } from "./hooks/useNotificationData";
import { NotificationDialogs } from "./NotificationDialogs";
import { SessionNotificationContent } from "./SessionNotificationContent";
import { ActionButton } from "./ActionButton";
import { LoadingState } from "./LoadingState";
import { HubInviteButtons } from "./hub-invite/HubInviteButtons";
import { useHubInvite } from "./hub-invite/useHubInvite";
import type { MentorSession } from "@/types/calendar";

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
  const [sessionData, setSessionData] = useState<MentorSession | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  // Extract token from action URL
  const token = action_url ? new URL(action_url).searchParams.get('token') : null;

  // Extract ID from action URL
  const contentId = action_url?.split('/').pop();

  // Fetch data using custom hook
  const { majorData, careerData, blogData } = useNotificationData(contentId, type, dialogOpen);

  // Hub invite handling
  const { isLoading: isInviteLoading, handleAccept, handleReject } = useHubInvite(token);

  useEffect(() => {
    const fetchSessionData = async () => {
      if (!isExpanded) return;
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

  const handleDetailClick = () => {
    if (type === 'availability_request') {
      navigate('/profile?tab=mentor');
      return;
    }
    setDialogOpen(true);
  };

  const renderActionButton = () => {
    // Don't show buttons for session-related notifications
    if (!action_url || type?.includes('session')) return null;

    if (type === 'hub_invite') {
      return (
        <HubInviteButtons 
          onAccept={handleAccept}
          onReject={handleReject}
          isLoading={isInviteLoading}
        />
      );
    }

    return <ActionButton onClick={handleDetailClick} />;
  };

  if (!isExpanded) {
    return (
      <p className="text-sm text-zinc-400 mt-1 line-clamp-2">
        {message.split(/[.!?]/)[0]}
      </p>
    );
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (!sessionData) {
    return (
      <div className="space-y-2 mt-3 text-sm text-zinc-400">
        <p>{message}</p>
        {renderActionButton()}
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
  }

  return (
    <div className="space-y-2 mt-3">
      <SessionNotificationContent sessionData={sessionData} />
      {renderActionButton()}
    </div>
  );
}
