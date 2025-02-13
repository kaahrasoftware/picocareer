import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNotificationData } from "./hooks/useNotificationData";
import { NotificationDialogs } from "./NotificationDialogs";
import { SessionNotificationContent } from "./SessionNotificationContent";
import type { MentorSession } from "@/types/calendar";
import { Skeleton } from "@/components/ui/skeleton";

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
  
  // Extract ID from action URL
  const contentId = action_url?.split('/').pop();

  // Fetch data using custom hook
  const { majorData, careerData, blogData } = useNotificationData(contentId, type, dialogOpen);

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

  const renderActionButton = () => {
    // Don't show View Detail button for session-related notifications
    if (!action_url || type?.includes('session')) return null;

    return (
      <Button
        variant="outline"
        size="sm"
        className="mt-2 text-sky-400 hover:text-sky-300 hover:bg-sky-400/10"
        onClick={() => setDialogOpen(true)}
      >
        View Detail
        <ExternalLink className="w-4 h-4 ml-2" />
      </Button>
    );
  };

  if (!isExpanded) {
    return (
      <p className="text-sm text-zinc-400 mt-1 line-clamp-2">
        {message.split(/[.!?]/)[0]}
      </p>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-2 mt-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
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