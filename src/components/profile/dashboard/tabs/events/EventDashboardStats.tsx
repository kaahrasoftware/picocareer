
import React from 'react';
import { usePaginatedQuery } from '@/hooks/usePaginatedQuery';
import { StatsCard } from '@/components/profile/dashboard/StatsCard';
import { Calendar, Users, Award, Video } from 'lucide-react';

export function EventDashboardStats() {
  const { data: events = [], isLoading, error } = usePaginatedQuery<any>({
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

  // Count events by type with null checking
  const eventsByType = events?.reduce((acc: Record<string, number>, event: any) => {
    if (!event) return acc;
    const type = event.event_type || 'Other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {}) || {};

  // Get most popular event type
  let mostPopularType = 'None';
  let maxCount = 0;
  
  if (Object.keys(eventsByType).length > 0) {
    Object.entries(eventsByType).forEach(([type, count]) => {
      if ((count as number) > maxCount) {
        mostPopularType = type;
        maxCount = count as number;
      }
    });
  }

  // Log for debugging purposes
  console.log("Events data:", { 
    totalCount: totalEvents, 
    upcoming: upcomingEvents, 
    past: pastEvents, 
    byType: eventsByType,
    isLoading,
    error
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard 
        title="Total Events" 
        value={totalEvents} 
        icon={<Calendar className="text-primary" />} 
        loading={isLoading}
      />
      <StatsCard 
        title="Upcoming Events" 
        value={upcomingEvents} 
        icon={<Award className="text-green-500" />} 
        loading={isLoading}
      />
      <StatsCard 
        title="Past Events" 
        value={pastEvents} 
        icon={<Calendar className="text-amber-500" />} 
        loading={isLoading}
      />
      <StatsCard 
        title="Most Popular Type" 
        value={mostPopularType} 
        icon={<Video className="text-blue-500" />} 
        loading={isLoading}
        valueClassName="text-sm"
      />
    </div>
  );
}
