
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Types for our event summary statistics
export interface EventSummaryStats {
  totalEvents: number;
  upcomingEvents: number;
  pastEvents: number;
  totalRegistrations: number;
  eventTypeDistribution: { type: string; count: number }[];
  popularEvents: { id: string; title: string; registrationCount: number }[];
  registrationTimeline: { date: string; count: number }[];
  geographicDistribution: { country: string; count: number }[];
  academicFieldDistribution: { field: string; count: number }[];
}

type TimePeriod = 'week' | 'month' | 'quarter' | 'year' | 'all';

export function useEventSummaryStats() {
  const [stats, setStats] = useState<EventSummaryStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEventSummaryStats();
  }, [timePeriod]);

  const fetchEventSummaryStats = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get current date for filtering
      const now = new Date();
      
      // Calculate the start date based on selected time period
      let startDate = new Date();
      switch (timePeriod) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        case 'all':
          // No filtering for 'all'
          startDate = new Date(0); // Beginning of time
          break;
      }

      // Convert dates to ISO strings for Supabase queries
      const startDateStr = startDate.toISOString();
      const nowStr = now.toISOString();

      // Get total events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('id, title, event_type, start_time')
        .gte('created_at', timePeriod === 'all' ? null : startDateStr);

      if (eventsError) throw eventsError;
      
      const totalEvents = eventsData?.length || 0;
      const upcomingEvents = eventsData?.filter(event => new Date(event.start_time) > now).length || 0;
      const pastEvents = totalEvents - upcomingEvents;
      
      // Get registrations
      const { data: registrationsData, error: registrationsError } = await supabase
        .from('event_registrations')
        .select('id, event_id, country, "current academic field/position", created_at')
        .gte('created_at', timePeriod === 'all' ? null : startDateStr);
      
      if (registrationsError) throw registrationsError;
      
      const totalRegistrations = registrationsData?.length || 0;
      
      // Process event type distribution
      const eventTypeMap: Record<string, number> = {};
      eventsData?.forEach(event => {
        const eventType = event.event_type || 'Unknown';
        eventTypeMap[eventType] = (eventTypeMap[eventType] || 0) + 1;
      });
      
      const eventTypeDistribution = Object.entries(eventTypeMap).map(([type, count]) => ({
        type,
        count
      }));
      
      // Calculate registrations by event to find most popular
      const eventRegistrationMap: Record<string, number> = {};
      const eventTitleMap: Record<string, string> = {};
      
      // First, build a map of event IDs to titles
      eventsData?.forEach(event => {
        eventTitleMap[event.id] = event.title;
      });
      
      // Count registrations per event
      registrationsData?.forEach(reg => {
        if (reg.event_id) {
          eventRegistrationMap[reg.event_id] = (eventRegistrationMap[reg.event_id] || 0) + 1;
        }
      });
      
      // Create popular events array sorted by registration count
      const popularEvents = Object.entries(eventRegistrationMap)
        .map(([id, count]) => ({
          id,
          title: eventTitleMap[id] || 'Unknown Event',
          registrationCount: count
        }))
        .sort((a, b) => b.registrationCount - a.registrationCount)
        .slice(0, 5);
      
      // Process geographic distribution
      const countryMap: Record<string, number> = {};
      registrationsData?.forEach(reg => {
        const country = reg.country || 'Unknown';
        countryMap[country] = (countryMap[country] || 0) + 1;
      });
      
      const geographicDistribution = Object.entries(countryMap)
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      // Process academic field distribution
      const fieldMap: Record<string, number> = {};
      registrationsData?.forEach(reg => {
        const field = reg["current academic field/position"] || 'Unknown';
        fieldMap[field] = (fieldMap[field] || 0) + 1;
      });
      
      const academicFieldDistribution = Object.entries(fieldMap)
        .map(([field, count]) => ({ field, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      // Create registration timeline data (registrations over time)
      const timelineMap: Record<string, number> = {};
      
      // Process by day, week, or month based on time period
      registrationsData?.forEach(reg => {
        // Format date appropriately based on time period
        let dateKey;
        const date = new Date(reg.created_at);
        
        if (timePeriod === 'week') {
          // For week, use daily format
          dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
        } else if (timePeriod === 'month') {
          // For month, use daily format
          dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
        } else if (timePeriod === 'quarter') {
          // For quarter, use weekly format
          const weekNumber = Math.floor(date.getDate() / 7) + 1;
          dateKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-W${weekNumber}`;
        } else {
          // For year and all, use monthly format
          dateKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        }
        
        timelineMap[dateKey] = (timelineMap[dateKey] || 0) + 1;
      });
      
      // Convert timeline data to array and sort by date
      const registrationTimeline = Object.entries(timelineMap)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));
      
      // Update state with all processed data
      setStats({
        totalEvents,
        upcomingEvents,
        pastEvents,
        totalRegistrations,
        eventTypeDistribution,
        popularEvents,
        registrationTimeline,
        geographicDistribution,
        academicFieldDistribution
      });
    } catch (error: any) {
      console.error('Error fetching event summary statistics:', error);
      setError(error.message || 'Failed to fetch event statistics');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    stats,
    isLoading,
    error,
    timePeriod,
    setTimePeriod,
    refreshStats: fetchEventSummaryStats
  };
}
