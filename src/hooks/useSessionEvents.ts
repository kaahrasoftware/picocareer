
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuthSession } from "@/hooks/useAuthSession";
import type { CalendarEvent } from "@/types/calendar";

export function useSessionEvents() {
  const { session } = useAuthSession();
  const { toast } = useToast();
  const currentUserId = session?.user?.id;

  return useQuery({
    queryKey: ["session-events"],
    queryFn: async () => {
      if (!currentUserId) {
        throw new Error("No user session found");
      }

      // First check if user has timezone set
      const { data: userSettings, error: settingsError } = await supabase
        .from('user_settings')
        .select('setting_value')
        .eq('profile_id', currentUserId)
        .eq('setting_type', 'timezone')
        .single();

      if (settingsError) {
        console.error('Error fetching user timezone:', settingsError);
      } else if (!userSettings?.setting_value) {
        toast({
          title: "Timezone not set",
          description: "Please set your timezone in settings to ensure accurate scheduling.",
          variant: "destructive",
        });
      }

      // Fetch mentor sessions with proper column specification
      const { data: sessions, error } = await supabase
        .from("mentor_sessions")
        .select(`
          id,
          scheduled_at,
          status,
          meeting_link,
          notes,
          mentor:profiles!mentor_sessions_mentor_id_fkey(
            id,
            full_name,
            avatar_url
          ),
          mentee:profiles!mentor_sessions_mentee_id_fkey(
            id,
            full_name,
            avatar_url
          ),
          session_type:mentor_session_types!mentor_sessions_session_type_id_fkey(
            type,
            duration
          )
        `)
        .or(`mentor_id.eq.${currentUserId},mentee_id.eq.${currentUserId}`);

      if (error) {
        toast({
          title: "Error fetching sessions",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      // Fetch feedback status for these sessions
      const sessionIds = sessions.map(session => session.id);
      
      // Skip feedback query if there are no sessions
      if (sessionIds.length === 0) {
        return [];
      }
      
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('session_feedback')
        .select('session_id, from_profile_id')
        .in('session_id', sessionIds)
        .eq('from_profile_id', currentUserId);
        
      if (feedbackError) {
        console.error('Error fetching feedback data:', feedbackError);
      }
      
      // Create a map of session IDs that have feedback from current user
      const feedbackMap = new Map();
      if (feedbackData) {
        feedbackData.forEach(feedback => {
          feedbackMap.set(feedback.session_id, true);
        });
      }

      // Transform sessions into calendar events
      const events: CalendarEvent[] = sessions.map((session) => {
        // Check if current user has provided feedback for this session
        const hasFeedback = feedbackMap.has(session.id);
        
        return {
          id: session.id,
          title: `Session with ${
            session.mentor.id === currentUserId
              ? session.mentee.full_name
              : session.mentor.full_name
          }`,
          description: `Mentoring session`,
          start_time: session.scheduled_at,
          end_time: new Date(
            new Date(session.scheduled_at).getTime() +
              (session.session_type?.duration || 60) * 60 * 1000
          ).toISOString(),
          event_type: 'session',
          status: session.status,
          session_details: {
            id: session.id,
            scheduled_at: session.scheduled_at,
            status: session.status,
            notes: session.notes,
            meeting_link: session.meeting_link,
            mentor: session.mentor,
            mentee: session.mentee,
            session_type: session.session_type,
            has_feedback: hasFeedback, // Add feedback status
          },
        };
      });

      return events;
    },
    enabled: !!session?.user,
  });
}
