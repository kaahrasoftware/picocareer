
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
          ),
          feedback:session_feedback!inner(id)
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

      // Get separate feedback count to check if there's any feedback for each session
      const { data: feedbackData, error: feedbackError } = await supabase
        .from("session_feedback")
        .select('session_id, from_profile_id')
        .eq('from_profile_id', currentUserId);

      if (feedbackError) {
        console.error('Error fetching feedback:', feedbackError);
      }

      // Create a map of session IDs that have feedback from the current user
      const sessionsWithFeedback = new Set(
        (feedbackData || [])
          .filter(f => f.from_profile_id === currentUserId)
          .map(f => f.session_id)
      );

      // Transform sessions into calendar events
      const events: CalendarEvent[] = sessions
        .filter(session => {
          // Validate the scheduled_at date - skip entries with invalid dates
          try {
            const date = new Date(session.scheduled_at);
            return !isNaN(date.getTime());
          } catch (e) {
            console.error('Invalid scheduled_at date:', session.scheduled_at, e);
            return false;
          }
        })
        .map((session) => {
          // Ensure we have valid dates by parsing and validating the scheduled_at
          const startTime = new Date(session.scheduled_at);
          
          // Calculate end time using session duration or default to 60 minutes
          const sessionDuration = session.session_type?.duration || 60;
          const endTime = new Date(startTime.getTime() + sessionDuration * 60 * 1000);
          
          return {
            id: session.id,
            title: `Session with ${
              session.mentor.id === currentUserId
                ? session.mentee.full_name
                : session.mentor.full_name
            }`,
            description: `Mentoring session`,
            // Store ISO strings for consistency across components
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            // Also include proper Date objects for direct use in UI components
            start: startTime,
            end: endTime,
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
              has_feedback: sessionsWithFeedback.has(session.id)
            },
            user_id: currentUserId
          };
        });

      return events;
    },
    enabled: !!session?.user,
  });
}
