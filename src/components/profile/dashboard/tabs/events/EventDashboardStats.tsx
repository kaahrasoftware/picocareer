
import React from 'react';
import { usePaginatedQuery } from '@/hooks/usePaginatedQuery';
import { StatsCard } from '../../StatsCard';
import { Calendar, Award, Video, Users } from 'lucide-react';

export function EventDashboardStats() {
  const {
    data: events = [],
    isLoading
  } = usePaginatedQuery<any>({
    table: 'events',
    limit: 1000 // Large limit to fetch all events for stats calculation
  });

  // Calculate stats from fetched events
  const totalEvents = events?.length || 0;
  const upcomingEvents = events?.filter(event => event?.start_time && new Date(event.start_time) > new Date())?.length || 0;
  const pastEvents = totalEvents - upcomingEvents;

  // Count events by type
  const eventsByType = events?.reduce((acc: Record<string, number>, event: any) => {
    if (!event) return acc;
    const type = event.event_type || 'Other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {}) || {};

  // Get most popular event type
  let mostPopularType = 'None';
  let maxCount = 0;
  Object.entries(eventsByType).forEach(([type, count]) => {
    if (count as number > maxCount) {
      mostPopularType = type;
      maxCount = count as number;
    }
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <StatsCard
        title="Total Events"
        value={totalEvents}
        icon={<Calendar className="h-4 w-4" />}
        loading={isLoading}
      />
      
      <StatsCard
        title="Upcoming Events"
        value={upcomingEvents}
        icon={<Calendar className="h-4 w-4" />}
        loading={isLoading}
      />
      
      <StatsCard
        title="Past Events"
        value={pastEvents}
        icon={<Calendar className="h-4 w-4" />}
        loading={isLoading}
      />
      
      <StatsCard
        title="Popular Type"
        value={mostPopularType}
        valueIsText={true}
        icon={<Award className="h-4 w-4" />}
        loading={isLoading}
      />
    </div>
  );
}
