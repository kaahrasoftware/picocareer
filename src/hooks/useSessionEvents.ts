import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { CalendarEvent, MentorSession } from '@/types/calendar';
import { useToast } from '@/hooks/use-toast';

export function useSessionEvents(date: Date) {
  const [data, setData] = useState<CalendarEvent[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchEvents() {
      try {
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
            mentor:profiles!mentor_id(id, full_name),
            mentee:profiles!mentee_id(id, full_name),
            session_type:mentor_session_types(type, duration)
          `)
          .gte('scheduled_at', startOfDay.toISOString())
          .lte('scheduled_at', endOfDay.toISOString());

        if (error) throw error;

        const events: CalendarEvent[] = (sessions as MentorSession[]).map(session => ({
          id: session.id,
          title: `Session with ${session.mentee.full_name}`,
          description: session.notes || '',
          start_time: session.scheduled_at,
          end_time: new Date(new Date(session.scheduled_at).getTime() + (session.session_type.duration * 60 * 1000)).toISOString(),
          event_type: 'session',
          status: session.status,
          session_details: session
        }));

        setData(events);
      } catch (error) {
        console.error('Error fetching events:', error);
        toast({
          title: "Error",
          description: "Failed to load calendar events",
          variant: "destructive",
        });
      }
    }

    if (date) {
      fetchEvents();
    }
  }, [date, toast]);

  return { data };
}