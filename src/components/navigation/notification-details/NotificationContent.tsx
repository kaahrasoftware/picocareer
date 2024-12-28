import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { MentorSession } from "@/types/calendar";

interface NotificationContentProps {
  message: string;
  isExpanded: boolean;
}

export function NotificationContent({ message, isExpanded }: NotificationContentProps) {
  const [sessionData, setSessionData] = useState<MentorSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchSessionData = async () => {
      if (!isExpanded) return;
      
      setIsLoading(true);
      try {
        // Try to extract meeting link first
        const meetingLinkMatch = message.match(/href="([^"]+)"/);
        if (meetingLinkMatch) {
          console.log('Found meeting link:', meetingLinkMatch[1]);
          
          // Query sessions with this meeting link
          const { data, error } = await supabase
            .from('mentor_sessions')
            .select(`
              id,
              scheduled_at,
              notes,
              meeting_platform,
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
            console.log('Session data fetched successfully:', data);
            setSessionData(data as MentorSession);
          } else {
            console.log('No session data found for meeting link');
          }
        } else {
          console.log('No meeting link found in message');
        }
      } catch (error) {
        console.error('Error in fetchSessionData:', error);
        toast({
          title: "Error loading session details",
          description: "Please try again later",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionData();
  }, [isExpanded, message, toast]);

  // Get first sentence for collapsed view
  const firstSentence = message.split(/[.!?]/)[0];
  
  if (!isExpanded) {
    return (
      <p className="text-sm text-zinc-400 mt-1 line-clamp-2">
        {firstSentence}
      </p>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-2 mt-3 text-sm text-zinc-400">
        <p>Loading session details...</p>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="space-y-2 mt-3 text-sm text-zinc-400">
        <p>{message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 mt-3 text-sm text-zinc-400">
      <p><span className="font-medium text-zinc-300">Mentor:</span> {sessionData.mentor?.full_name}</p>
      <p><span className="font-medium text-zinc-300">Mentee:</span> {sessionData.mentee?.full_name}</p>
      <p><span className="font-medium text-zinc-300">Start Time:</span> {new Date(sessionData.scheduled_at).toLocaleString()}</p>
      <p><span className="font-medium text-zinc-300">Duration:</span> {sessionData.session_type?.duration} minutes</p>
      <p><span className="font-medium text-zinc-300">Platform:</span> {sessionData.meeting_platform}</p>
      {sessionData.notes && (
        <p><span className="font-medium text-zinc-300">Note:</span> {sessionData.notes}</p>
      )}
    </div>
  );
}