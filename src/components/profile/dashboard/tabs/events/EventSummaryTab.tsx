
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EventMetricsCards } from './EventMetricsCards';
import { EventRankingTable } from './EventRankingTable';
import { EventEngagementCharts } from './EventEngagementCharts';

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
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Average registrations per event:</span>
                  <span className="font-medium">
                    {stats?.totalEvents ? Math.round(stats.totalRegistrations / stats.totalEvents) : 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Events with registrations:</span>
                  <span className="font-medium">
                    {stats?.rankedEvents.filter(e => e.registrationCount > 0).length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Most popular event:</span>
                  <span className="font-medium text-right max-w-32 truncate">
                    {stats?.rankedEvents[0]?.title || 'N/A'}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Event Engagement Demographics */}
      <Card>
        <CardHeader>
          <CardTitle>Event Engagement & Demographics</CardTitle>
        </CardHeader>
        <CardContent>
          <EventEngagementCharts />
        </CardContent>
      </Card>
    </div>
  );
}
