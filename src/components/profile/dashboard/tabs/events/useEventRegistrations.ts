
import { useState, useEffect, useMemo } from 'react';
import { usePaginatedQuery } from '@/hooks/usePaginatedQuery';
import { supabase } from '@/integrations/supabase/client';

export function useEventRegistrations() {
  const [selectedEvent, setSelectedEvent] = useState<string>('all');
  const [events, setEvents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [registrationCounts, setRegistrationCounts] = useState<Record<string, number>>({});
  const [selectedEventTitle, setSelectedEventTitle] = useState<string | undefined>(undefined);
  const [countriesData, setCountriesData] = useState<Record<string, number>>({});
  const [academicFieldsData, setAcademicFieldsData] = useState<Record<string, number>>({});
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

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

  // Fetch all events for the selector
  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id, title, start_time')
        .order('start_time', { ascending: false });
      
      if (error) throw error;
      setEvents(data || []);

      // Also get registration counts for each event
      await fetchRegistrationCounts();
    } catch (error: any) {
      console.error('Error fetching events:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch registration counts for each event
  const fetchRegistrationCounts = async () => {
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select('event_id')
      
      if (error) throw error;
      
      // Count registrations for each event
      const counts: Record<string, number> = {};
      data.forEach(reg => {
        if (reg.event_id) {
          counts[reg.event_id] = (counts[reg.event_id] || 0) + 1;
        }
      });
      
      setRegistrationCounts(counts);
    } catch (error: any) {
      console.error('Error fetching registration counts:', error.message);
    }
  };

  // Fetch analytics data when an event is selected
  const fetchEventAnalytics = async () => {
    if (selectedEvent === 'all') {
      setCountriesData({});
      setAcademicFieldsData({});
      return;
    }

    setIsLoadingAnalytics(true);
    try {
      // Get the selected event title
      const selectedEventObj = events.find(event => event.id === selectedEvent);
      if (selectedEventObj) {
        setSelectedEventTitle(selectedEventObj.title);
      }

      // Get registrations for the selected event to analyze
      const { data, error } = await supabase
        .from('event_registrations')
        .select('country, "current academic field/position"')
        .eq('event_id', selectedEvent);
      
      if (error) throw error;

      // Count countries
      const countries: Record<string, number> = {};
      data.forEach(reg => {
        const country = reg.country || 'Unknown';
        countries[country] = (countries[country] || 0) + 1;
      });
      setCountriesData(countries);

      // Count academic fields
      const fields: Record<string, number> = {};
      data.forEach(reg => {
        const field = reg["current academic field/position"] || 'Unknown';
        fields[field] = (fields[field] || 0) + 1;
      });
      setAcademicFieldsData(fields);
    } catch (error: any) {
      console.error('Error fetching event analytics:', error.message);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  // Update analytics when selected event changes
  useEffect(() => {
    fetchEventAnalytics();
  }, [selectedEvent]);

  const currentEventRegistrationCount = useMemo(() => {
    return selectedEvent !== 'all' ? (registrationCounts[selectedEvent] || 0) : totalCount;
  }, [selectedEvent, registrationCounts, totalCount]);

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
    setSearchQuery,
    registrationCounts,
    selectedEventTitle,
    countriesData,
    academicFieldsData,
    isLoadingAnalytics,
    currentEventRegistrationCount
  };
}
