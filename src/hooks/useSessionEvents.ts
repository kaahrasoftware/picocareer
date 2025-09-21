
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
        console.log('Processing session:', session.id, 'scheduled_at:', session.scheduled_at);
        
        // Check if current user has provided feedback for this session
        const hasFeedback = feedbackMap.has(session.id);
        
        // Handle null/undefined dates gracefully
        if (!session.scheduled_at) {
          console.warn('Session has no scheduled_at date:', session.id);
          return null;
        }
        
        const startDate = new Date(session.scheduled_at);
        
        // Validate date parsing
        if (isNaN(startDate.getTime())) {
          console.error('Invalid date for session:', session.id, session.scheduled_at);
          return null;
        }
        
        const endDate = new Date(
          startDate.getTime() + (session.session_type?.duration || 60) * 60 * 1000
        );
        
        // Map session status to CalendarEvent status type
        const mapStatus = (status: string): 'scheduled' | 'completed' | 'cancelled' | 'no_show' => {
          switch (status?.toLowerCase()) {
            case 'completed':
              return 'completed';
            case 'cancelled':
              return 'cancelled';
            case 'no_show':
              return 'no_show';
            default:
              return 'scheduled';
          }
        };
        
        // Handle null mentor/mentee data gracefully
        const mentorName = session.mentor?.full_name || 'Unknown Mentor';
        const menteeName = session.mentee?.full_name || 'Unknown Mentee';
        
        const sessionTitle = session.mentor?.id === currentUserId
          ? `Session with ${menteeName}`
          : `Session with ${mentorName}`;
        
        console.log('Created event for session:', session.id, 'title:', sessionTitle, 'start:', startDate);
        
        return {
          id: session.id,
          title: sessionTitle,
          description: `Mentoring session`,
          start: startDate,
          end: endDate,
          type: 'session',
          status: mapStatus(session.status),
          session_details: {
            id: session.id,
            scheduled_at: session.scheduled_at,
            status: session.status,
            notes: session.notes,
            meeting_link: session.meeting_link,
            mentor: session.mentor,
            mentee: session.mentee,
            session_type: session.session_type,
            has_feedback: hasFeedback,
          },
        };
      }).filter(Boolean) as CalendarEvent[]; // Remove null entries

      console.log('Final events array:', events.length, 'events created');

      return events;
    },
    enabled: !!session?.user,
  });
}
