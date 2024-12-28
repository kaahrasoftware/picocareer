import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { MentorSession } from "@/types/database/session";
import type { CalendarEvent } from "@/types/calendar";
import { format } from "date-fns";
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';

export function useSessionEvents(date: Date) {
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  console.log("User timezone:", userTimezone);

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return useQuery({
    queryKey: ['session-events', date.toISOString()],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('mentor_sessions')
        .select(`
          id,
          scheduled_at,
          notes,
          status,
          mentor:profiles!mentor_sessions_mentor_id_fkey(id, full_name),
          mentee:profiles!mentor_sessions_mentee_id_fkey(id, full_name),
          session_type:mentor_session_types(type, duration)
        `)
        .gte('scheduled_at', startOfDay.toISOString())
        .lte('scheduled_at', endOfDay.toISOString())
        .or(`mentor_id.eq.${user.id},mentee_id.eq.${user.id}`)
        .single();

      if (error) throw error;

      // Transform MentorSession[] into CalendarEvent[]
      return (data as unknown as MentorSession[]).map(session => {
        // Convert scheduled_at to user's timezone
        const sessionStart = toZonedTime(new Date(session.scheduled_at), userTimezone);
        const sessionEnd = new Date(sessionStart.getTime() + session.session_type.duration * 60000);

        return {
          id: session.id,
          title: `Session with ${user.id === session.mentor.id ? session.mentee.full_name : session.mentor.full_name}`,
          description: session.notes || '',
          start_time: sessionStart.toISOString(),
          end_time: sessionEnd.toISOString(),
          event_type: 'session' as const,
          status: session.status,
          session_details: session
        };
      });
    },
    enabled: !!date,
  });
}