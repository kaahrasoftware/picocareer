import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { CalendarEvent } from "@/types/calendar";

export function useSessionEvents(date: Date) {
  return useQuery({
    queryKey: ['session-events', date.toISOString()],
    queryFn: async () => {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const { data: sessions, error } = await supabase
        .from('mentor_sessions')
        .select(`
          id,
          scheduled_at,
          status,
          notes,
          mentor:profiles!mentor_sessions_mentor_id_fkey(id, full_name),
          mentee:profiles!mentor_sessions_mentee_id_fkey(id, full_name),
          session_type:mentor_session_types!mentor_sessions_session_type_id_fkey(type, duration),
          meeting_link,
          meeting_platform,
          attendance_confirmed
        `)
        .gte('scheduled_at', startOfDay.toISOString())
        .lte('scheduled_at', endOfDay.toISOString());

      if (error) throw error;

      if (!sessions) return [];

      // Transform sessions into calendar events
      const events: CalendarEvent[] = sessions.map(session => {
        const startTime = new Date(session.scheduled_at);
        const endTime = new Date(startTime.getTime() + (session.session_type?.duration || 60) * 60000);

        return {
          id: session.id,
          title: `${session.session_type?.type || 'Mentoring'} Session`,
          description: `Session with ${session.mentee?.full_name || 'Unknown'}`,
          start_time: format(startTime, "HH:mm"),
          end_time: format(endTime, "HH:mm"),
          event_type: 'session',
          status: session.status,
          notes: session.notes,
          session_details: {
            id: session.id,
            scheduled_at: session.scheduled_at,
            status: session.status || 'scheduled',
            notes: session.notes,
            mentor: {
              id: session.mentor?.id || '',
              full_name: session.mentor?.full_name || ''
            },
            mentee: {
              id: session.mentee?.id || '',
              full_name: session.mentee?.full_name || ''
            },
            session_type: {
              type: session.session_type?.type || '',
              duration: session.session_type?.duration || 60
            },
            meeting_link: session.meeting_link,
            meeting_platform: session.meeting_platform,
            attendance_confirmed: session.attendance_confirmed
          }
        };
      });

      return events;
    },
    enabled: !!date
  });
}