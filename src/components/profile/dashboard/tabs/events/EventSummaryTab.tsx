
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePaginatedQuery } from '@/hooks/usePaginatedQuery';
import { EventMetricsCards } from './EventMetricsCards';
import { EventRankingTable } from './EventRankingTable';

export function EventSummaryTab() {
  const {
    data: events = [],
    isLoading
  } = usePaginatedQuery<any>({
    queryKey: ['admin-events-summary'],
    tableName: 'events',
    paginationOptions: {
      limit: 1000 // Large limit to fetch all events for stats calculation
    }
  });

  // Process event data for statistics
  const stats = React.useMemo(() => {
    if (isLoading || !events) return null;

    const now = new Date();
    const upcoming = events.filter(e => e?.start_time && new Date(e.start_time) > now).length;
    const past = events.filter(e => e?.start_time && new Date(e.start_time) <= now).length;
    
    // Get registration counts
    const totalRegistrations = events.reduce((total, event) => total + (event.registration_count || 0), 0);
    
    // Sort events by registration count for ranking
    const rankedEvents = [...events]
      .filter(e => e?.registration_count)
      .sort((a, b) => (b.registration_count || 0) - (a.registration_count || 0))
      .slice(0, 5) // Top 5 events
      .map(event => ({
        id: event.id,
        title: event.title || 'Untitled Event',
        registrationCount: event.registration_count || 0
      }));

    return {
      totalEvents: events.length,
      upcomingEvents: upcoming,
      pastEvents: past,
      totalRegistrations,
      rankedEvents
    };
  }, [events, isLoading]);

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
