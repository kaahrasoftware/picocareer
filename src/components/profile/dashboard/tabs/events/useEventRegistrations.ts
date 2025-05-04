
import { useState } from 'react';
import { usePaginatedQuery } from '@/hooks/usePaginatedQuery';
import { supabase } from '@/integrations/supabase/client';

export function useEventRegistrations() {
  const [selectedEvent, setSelectedEvent] = useState<string>('all');
  const [events, setEvents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch registrations with pagination
  const {
    data: registrations,
    isLoading: isRegistrationsLoading,
    count: totalCount,
    page,
    setPage,
    totalPages
  } = usePaginatedQuery<any>({
    queryKey: ['event-registrations', selectedEvent, searchQuery],
    tableName: 'event_registrations',
    paginationOptions: {
      limit: 15,
      orderBy: 'created_at',
      orderDirection: 'desc',
      searchQuery: searchQuery,
      searchColumn: 'email'
    },
    filters: selectedEvent !== 'all' ? { event_id: selectedEvent } : {},
    select: `
      id, first_name, last_name, email, country, 
      status, created_at, event_id,
      "current academic field/position", "current school/company",
      events(id, title)
    `
  });

  // Fetch all events for the dropdown
  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id, title')
        .order('title');
      
      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      console.error('Error fetching events:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    registrations,
    isRegistrationsLoading,
    totalCount,
    page,
    setPage,
    totalPages,
    events,
    fetchEvents,
    isLoading,
    selectedEvent,
    setSelectedEvent,
    searchQuery,
    setSearchQuery
  };
}
