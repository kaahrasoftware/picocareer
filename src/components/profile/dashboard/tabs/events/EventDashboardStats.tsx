
import React from 'react';
import { usePaginatedQuery } from '@/hooks/usePaginatedQuery';
import { StatsCard } from '../../StatsCard';
import { Calendar, Award, Video, Users } from 'lucide-react';

export function EventDashboardStats() {
  const { data: events = [], isLoading } = usePaginatedQuery<any>({
    queryKey: ['admin-events-stats'],
    tableName: 'events',
    paginationOptions: {
      limit: 1000 // Large limit to fetch all events for stats calculation
    }
  });

  // Calculate stats from fetched events
  const totalEvents = events?.length || 0;
  const upcomingEvents = events?.filter(event => 
    event?.start_time && new Date(event.start_time) > new Date()
  )?.length || 0;
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard 
        title="Total Events" 
        value={totalEvents} 
        icon={<Calendar className="h-4 w-4 text-primary" />} 
        loading={isLoading}
      />
      <StatsCard 
        title="Upcoming Events" 
        value={upcomingEvents} 
        icon={<Award className="h-4 w-4 text-green-500" />} 
        loading={isLoading}
      />
      <StatsCard 
        title="Past Events" 
        value={pastEvents} 
        icon={<Calendar className="h-4 w-4 text-amber-500" />} 
        loading={isLoading}
      />
      <StatsCard 
        title="Most Popular Type" 
        value={mostPopularType}
        icon={<Video className="h-4 w-4 text-blue-500" />} 
        loading={isLoading}
        valueClassName="text-sm"
      />
    </div>
  );
}
