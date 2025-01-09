import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CalendarEvent, Availability } from "@/types/calendar";
import { SessionType, MeetingPlatform } from "@/types/session";

export function useSessionEvents() {
  return useQuery({
    queryKey: ["session-events"],
    queryFn: async () => {
      const { data: sessions, error: sessionsError } = await supabase
        .from("mentor_sessions")
        .select(`
          id,
          scheduled_at,
          status,
          notes,
          meeting_link,
          mentor:mentor_id(id, full_name),
          mentee:mentee_id(id, full_name),
          session_type:session_type_id(type, duration)
        `);

      if (sessionsError) throw sessionsError;

      const { data: availability, error: availabilityError } = await supabase
        .from("mentor_availability")
        .select("*");

      if (availabilityError) throw availabilityError;

      const events: CalendarEvent[] = sessions.map((session) => ({
        id: session.id,
        title: `Session with ${session.mentee?.full_name || 'Unknown'}`,
        description: session.notes || "",
        start_date_time: session.scheduled_at,
        end_date_time: new Date(new Date(session.scheduled_at).getTime() + 
          (session.session_type?.duration || 60) * 60 * 1000).toISOString(),
        event_type: "session",
        status: session.status,
        session_details: {
          id: session.id,
          scheduled_at: session.scheduled_at,
          status: session.status,
          mentor: session.mentor || { id: '', full_name: 'Unknown' },
          mentee: session.mentee || { id: '', full_name: 'Unknown' },
          session_type: session.session_type as { type: SessionType; duration: number },
          meeting_link: session.meeting_link,
        }
      }));

      const availabilitySlots: Availability[] = availability.map((slot) => ({
        id: slot.id,
        start_date_time: slot.start_date_time,
        end_date_time: slot.end_date_time,
        is_available: slot.is_available,
        recurring: slot.recurring,
        day_of_week: slot.day_of_week
      }));

      return {
        events,
        availability: availabilitySlots
      };
    }
  });
}