
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EventMetricsCards } from './EventMetricsCards';
import { EventRankingTable } from './EventRankingTable';
import { EventEngagementCharts } from './EventEngagementCharts';
import { ColorfulStatCard } from '@/components/ui/colorful-stat-card';
import { TrendingUp, Users, Trophy, Activity } from 'lucide-react';

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

  // Calculate enhanced statistics for the modern cards
  const enhancedStats = React.useMemo(() => {
    if (!stats) return null;

    const averageRegistrations = stats.totalEvents > 0 
      ? Math.round(stats.totalRegistrations / stats.totalEvents) 
      : 0;

    const eventsWithRegistrations = stats.rankedEvents.filter(e => e.registrationCount > 0).length;
    
    const engagementRate = stats.totalEvents > 0 
      ? Math.round((eventsWithRegistrations / stats.totalEvents) * 100)
      : 0;

    const mostPopularEvent = stats.rankedEvents[0];

    return {
      averageRegistrations,
      eventsWithRegistrations,
      engagementRate,
      mostPopularEvent
    };
  }, [stats]);

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
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ColorfulStatCard
                  title="Average Registrations"
                  value={enhancedStats?.averageRegistrations || 0}
                  icon={<TrendingUp className="h-5 w-5" />}
                  variant="blue"
                  footer="per event"
                />
                
                <ColorfulStatCard
                  title="Active Events"
                  value={`${enhancedStats?.eventsWithRegistrations || 0}/${stats?.totalEvents || 0}`}
                  icon={<Activity className="h-5 w-5" />}
                  variant="green"
                  footer="events with registrations"
                />
                
                <ColorfulStatCard
                  title="Engagement Rate"
                  value={`${enhancedStats?.engagementRate || 0}%`}
                  icon={<Users className="h-5 w-5" />}
                  variant="purple"
                  footer="events attracting participants"
                  showProgress={true}
                  progressValue={enhancedStats?.engagementRate || 0}
                />
                
                <ColorfulStatCard
                  title="Top Performer"
                  value={enhancedStats?.mostPopularEvent?.registrationCount || 0}
                  icon={<Trophy className="h-5 w-5" />}
                  variant="amber"
                  footer={
                    enhancedStats?.mostPopularEvent?.title 
                      ? enhancedStats.mostPopularEvent.title.length > 20
                        ? `${enhancedStats.mostPopularEvent.title.substring(0, 20)}...`
                        : enhancedStats.mostPopularEvent.title
                      : 'No events yet'
                  }
                />
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
