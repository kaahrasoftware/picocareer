
import { useState, useEffect, useMemo, useCallback } from 'react';
import { usePaginatedQuery } from '@/hooks/usePaginatedQuery';
import { supabase } from '@/integrations/supabase/client';
import { useEvents } from '@/hooks/useEvents';

export function useEventRegistrations() {
  const [selectedEvent, setSelectedEvent] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventTitle, setSelectedEventTitle] = useState<string | undefined>(undefined);
  const [countriesData, setCountriesData] = useState<Record<string, number>>({});
  const [academicFieldsData, setAcademicFieldsData] = useState<Record<string, number>>({});
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  // Use the new events hook
  const { events, registrationCounts, isLoading } = useEvents();

  // Fetch registrations with pagination
  const {
    data: registrations,
    isLoading: isRegistrationsLoading,
    totalCount,
    page,
    setPage,
    totalPages
  } = usePaginatedQuery<any>({
    table: 'event_registrations',
    page: 1,
    limit: 15,
    orderBy: 'created_at',
    orderDirection: 'desc',
    searchQuery: searchQuery,
    searchField: 'email',
    filters: selectedEvent !== 'all' ? { event_id: selectedEvent } : {},
    select: `
      id, first_name, last_name, email, country, 
      status, created_at, event_id,
      "current academic field/position", "current school/company",
      events(id, title)
    `
  });

  // Fetch analytics data when an event is selected
  const fetchEventAnalytics = useCallback(async () => {
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
      data.forEach((reg: any) => {
        const country = reg.country || 'Unknown';
        countries[country] = (countries[country] || 0) + 1;
      });
      setCountriesData(countries);

      // Count academic fields
      const fields: Record<string, number> = {};
      data.forEach((reg: any) => {
        const field = reg["current academic field/position"] || 'Unknown';
        fields[field] = (fields[field] || 0) + 1;
      });
      setAcademicFieldsData(fields);
    } catch (error: any) {
      console.error('Error fetching event analytics:', error.message);
    } finally {
      setIsLoadingAnalytics(false);
    }
  }, [selectedEvent, events]);

  // Update analytics when selected event changes
  useEffect(() => {
    if (events.length > 0) {
      fetchEventAnalytics();
    }
  }, [selectedEvent, events, fetchEventAnalytics]);

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
    fetchEvents: () => {}, // Not needed anymore since useEvents handles this
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
