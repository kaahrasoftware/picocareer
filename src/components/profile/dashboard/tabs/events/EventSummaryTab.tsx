
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EventMetricsCards } from './EventMetricsCards';
import { EventRankingTable } from './EventRankingTable';

export function EventSummaryTab() {
  // Fetch all events for statistics
  const { data: events = [], isLoading: isEventsLoading } = useQuery({
    queryKey: ['admin-events-summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_time', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch registration counts
  const { data: registrationsData = [], isLoading: isRegistrationsLoading } = useQuery({
    queryKey: ['admin-event-registrations-summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_registrations')
        .select('event_id, events(id, title)');
      
      if (error) throw error;
      return data;
    }
  });

  const isLoading = isEventsLoading || isRegistrationsLoading;

  // Process event data for statistics
  const stats = React.useMemo(() => {
    if (isLoading || !events || !registrationsData) return null;

    const now = new Date();
    const upcoming = events.filter(e => e?.start_time && new Date(e.start_time) > now).length;
    const past = events.filter(e => e?.start_time && new Date(e.start_time) <= now).length;
    
    // Calculate registration counts per event
    const regCountsByEvent: Record<string, number> = {};
    registrationsData.forEach(reg => {
      if (reg.event_id) {
        regCountsByEvent[reg.event_id] = (regCountsByEvent[reg.event_id] || 0) + 1;
      }
    });
    
    // Get total registrations
    const totalRegistrations = Object.values(regCountsByEvent).reduce((sum, count) => sum + count, 0);
    
    // Create ranked events by registration count
    const eventsWithCounts = events.map(event => ({
      id: event.id,
      title: event.title || 'Untitled Event',
      registrationCount: regCountsByEvent[event.id] || 0
    }));
    
    // Sort events by registration count
    const rankedEvents = eventsWithCounts
      .sort((a, b) => b.registrationCount - a.registrationCount)
      .slice(0, 5); // Top 5 events

    return {
      totalEvents: events.length,
      upcomingEvents: upcoming,
      pastEvents: past,
      totalRegistrations,
      rankedEvents
    };
  }, [events, registrationsData, isLoading]);

  return (
    <div className="space-y-6">
      <EventMetricsCards stats={stats} isLoading={isLoading} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Events by Registration</CardTitle>
          </CardHeader>
          <CardContent>
            <EventRankingTable 
              events={stats?.rankedEvents || []}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Event Engagement</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
            Event engagement charts coming soon
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
