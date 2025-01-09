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

      const events: CalendarEvent[] = sessions.map((session) => ({
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
        created_at: new Date().toISOString(), // Add missing properties
        updated_at: new Date().toISOString(),
        session_details: {
          id: session.id,
          scheduled_at: session.scheduled_at,
          status: session.status,
          notes: session.notes,
          meeting_link: session.meeting_link,
          mentor: session.mentor,
          mentee: session.mentee,
          session_type: session.session_type,
        },
      }));

      return events;
    },
    enabled: !!session?.user,
  });
}