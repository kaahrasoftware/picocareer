import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { MentorSession, CalendarEvent } from "@/types/calendar";

export function useSessionEvents(selectedDate: Date | undefined, userId: string | undefined) {
  return useQuery({
    queryKey: ['calendar_events', selectedDate],
    queryFn: async () => {
      if (!selectedDate || !userId) return [];

      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const { data: sessions, error: sessionsError } = await supabase
        .from('mentor_sessions')
        .select(`
          id,
          scheduled_at,
          status,
          notes,
          mentor:mentor_id(id, full_name),
          mentee:mentee_id(id, full_name),
          session_type:session_type_id(type, duration)
        `)
        .gte('scheduled_at', startOfDay.toISOString())
        .lte('scheduled_at', endOfDay.toISOString())
        .or(`mentor_id.eq.${userId},mentee_id.eq.${userId}`);

      if (sessionsError) throw sessionsError;

      // Convert sessions to calendar events
      const sessionEvents: CalendarEvent[] = (sessions as MentorSession[]).map(session => ({
        id: session.id,
        title: `Session with ${session.mentor.id === userId ? session.mentee.full_name : session.mentor.full_name}`,
        description: `${session.session_type.type} (${session.session_type.duration} minutes)`,
        start_time: session.scheduled_at,
        end_time: new Date(new Date(session.scheduled_at).getTime() + session.session_type.duration * 60000).toISOString(),
        event_type: 'session',
        status: session.status,
        notes: session.notes,
        session_details: session
      }));

      return sessionEvents;
    },
    enabled: !!selectedDate && !!userId,
  });
}