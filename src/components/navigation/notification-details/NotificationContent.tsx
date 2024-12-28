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
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        // Extract session ID from the message using regex
        const sessionIdMatch = message.match(/Session ID: ([a-f0-9-]+)/);
        const sessionId = sessionIdMatch ? sessionIdMatch[1] : null;

        if (!sessionId) {
          console.log('No session ID found in message:', message);
          return;
        }

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
          .eq('id', sessionId)
          .maybeSingle();

        if (error) {
          console.error('Error fetching session data:', error);
          toast({
            title: "Error loading session details",
            description: "Please try again later",
            variant: "destructive",
          });
          return;
        }

        if (data) {
          setSessionData(data as MentorSession);
        }
      } catch (error) {
        console.error('Error in fetchSessionData:', error);
      }
    };

    if (isExpanded) {
      fetchSessionData();
    }
  }, [isExpanded, message, toast]);

  // Get first sentence for collapsed view
  const firstSentence = message.split(/[.!?]/)[0];
  
  if (isExpanded) {
    return (
      <div className="space-y-2 mt-3 text-sm text-zinc-400">
        <p><span className="font-medium text-zinc-300">Mentor:</span> {sessionData?.mentor?.full_name || 'Loading...'}</p>
        <p><span className="font-medium text-zinc-300">Mentee:</span> {sessionData?.mentee?.full_name || 'Loading...'}</p>
        <p><span className="font-medium text-zinc-300">Start Time:</span> {sessionData ? new Date(sessionData.scheduled_at).toLocaleString() : 'Loading...'}</p>
        <p><span className="font-medium text-zinc-300">Duration:</span> {sessionData?.session_type?.duration || 'Loading...'} minutes</p>
        <p><span className="font-medium text-zinc-300">Platform:</span> {sessionData?.meeting_platform || 'Loading...'}</p>
        {sessionData?.notes && (
          <p><span className="font-medium text-zinc-300">Note:</span> {sessionData.notes}</p>
        )}
      </div>
    );
  }

  return (
    <p className="text-sm text-zinc-400 mt-1 line-clamp-2">
      {firstSentence}
    </p>
  );
}