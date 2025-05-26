
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Event {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  location?: string;
  status: string;
  description: string;
  author_id?: string;
  event_type: string;
  platform: string;
  meeting_link?: string;
  max_attendees?: number;
  organized_by?: string;
  facilitator?: string;
  thumbnail_url?: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [registrationCounts, setRegistrationCounts] = useState<Record<string, number>>({});
  const { toast } = useToast();

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .order('start_time', { ascending: false });

      if (eventsError) throw eventsError;

      setEvents(eventsData || []);

      // Fetch registration counts for each event
      const { data: registrationsData, error: registrationsError } = await supabase
        .from('event_registrations')
        .select('event_id, id');

      if (registrationsError) throw registrationsError;

      // Count registrations by event
      const counts: Record<string, number> = {};
      registrationsData?.forEach((registration) => {
        if (registration.event_id) {
          counts[registration.event_id] = (counts[registration.event_id] || 0) + 1;
        }
      });

      setRegistrationCounts(counts);
    } catch (error: any) {
      console.error('Error fetching events:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch events. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return {
    events,
    isLoading,
    registrationCounts,
    refetch: fetchEvents,
  };
}
