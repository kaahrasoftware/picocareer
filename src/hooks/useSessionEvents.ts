import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { MentorSession } from "@/types/database/session";
import type { CalendarEvent } from "@/types/calendar";

export function useSessionEvents(date: Date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return useQuery({
    queryKey: ['session-events', date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentor_sessions')
        .select(`
          id,
          scheduled_at,
          status,
          notes,
          mentor:profiles!mentor_id(id, full_name),
          mentee:profiles!mentee_id(id, full_name),
          session_type:mentor_session_types(type, duration)
        `)
        .gte('scheduled_at', startOfDay.toISOString())
        .lte('scheduled_at', endOfDay.toISOString())
        .order('scheduled_at', { ascending: true });

      if (error) throw error;

      // Transform sessions into calendar events
      const events: CalendarEvent[] = data.map(session => ({
        id: session.id,
        title: `Session with ${session.mentee[0].full_name}`,
        description: session.notes || '',
        start_time: session.scheduled_at,
        end_time: new Date(new Date(session.scheduled_at).getTime() + (session.session_type[0].duration * 60 * 1000)).toISOString(),
        event_type: 'session',
        status: session.status,
        session_details: {
          id: session.id,
          scheduled_at: session.scheduled_at,
          status: session.status,
          notes: session.notes,
          mentor: session.mentor[0],
          mentee: session.mentee[0],
          session_type: session.session_type[0]
        }
      }));

      return events;
    },
  });
}