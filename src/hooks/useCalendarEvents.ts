import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { BookedSession } from "@/types/calendar";
import { Event } from "@/components/profile/calendar/EventList";

export function useCalendarEvents(selectedDate: Date | undefined, userId: string | undefined) {
  // Get booked sessions
  const { data: bookedSessions = [], isLoading: isSessionsLoading } = useQuery({
    queryKey: ['booked_sessions', userId, selectedDate],
    queryFn: async () => {
      if (!userId || !selectedDate) return [];

      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const { data: sessions, error } = await supabase
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
        .or(`mentor_id.eq.${userId},mentee_id.eq.${userId}`)
        .gte('scheduled_at', startOfDay.toISOString())
        .lte('scheduled_at', endOfDay.toISOString());

      if (error) throw error;

      // Convert sessions to calendar events format
      return (sessions as unknown as BookedSession[]).map(session => ({
        id: session.id,
        title: `Session with ${session.mentor.id === userId ? session.mentee.full_name : session.mentor.full_name}`,
        description: session.notes || `${session.session_type.type} session`,
        start_time: session.scheduled_at,
        end_time: new Date(new Date(session.scheduled_at).getTime() + session.session_type.duration * 60000).toISOString(),
        event_type: 'session' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
    },
    enabled: !!userId && !!selectedDate,
  });

  // Get calendar events
  const { data: events = [], isLoading: isEventsLoading } = useQuery({
    queryKey: ['calendar_events', selectedDate],
    queryFn: async () => {
      if (!selectedDate) return [];

      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .gte('start_time', startOfDay.toISOString())
        .lte('end_time', endOfDay.toISOString())
        .returns<Event[]>();

      if (error) throw error;
      return data;
    },
    enabled: !!selectedDate,
  });

  return {
    bookedSessions,
    events,
    isLoading: isSessionsLoading || isEventsLoading,
    allEvents: [...events, ...bookedSessions]
  };
}