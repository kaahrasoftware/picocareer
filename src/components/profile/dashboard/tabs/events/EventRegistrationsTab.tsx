
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExportButton } from './ExportButton';
import { RegistrationsTable } from './RegistrationsTable';
import { RegistrationsSearchFilters } from './RegistrationsSearchFilters';
import { RegistrationsPagination } from './RegistrationsPagination';
import { useEventRegistrations } from './useEventRegistrations';
import { EventSelector } from './EventSelector';
import { RegistrationSummary } from './RegistrationSummary';

export function EventRegistrationsTab() {
  const {
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
    currentEventRegistrationCount
  } = useEventRegistrations();

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Event Registrations</h2>
        <ExportButton 
          selectedEvent={selectedEvent}
          searchQuery={searchQuery}
          eventTitle={selectedEventTitle}
        />
      </div>

      {/* Event Selector */}
      <EventSelector 
        events={events}
        selectedEvent={selectedEvent}
        onEventChange={setSelectedEvent}
        registrationCounts={registrationCounts}
        isLoading={isLoading}
      />

      {/* Registration Summary (only shown when specific event is selected) */}
      <RegistrationSummary 
        selectedEvent={selectedEvent}
        eventTitle={selectedEventTitle}
        registrationCount={currentEventRegistrationCount}
        countriesData={countriesData}
        academicFieldsData={academicFieldsData}
      />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>
            {selectedEvent === 'all' ? 
              'All Registrations' : 
              `Registrations: ${selectedEventTitle || 'Selected Event'}`
            }
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RegistrationsSearchFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedEvent={selectedEvent}
          />

          <RegistrationsTable 
            registrations={registrations}
            isLoading={isRegistrationsLoading}
            selectedEvent={selectedEvent}
          />

          <RegistrationsPagination
            currentPage={page}
            totalPages={totalPages}
            setPage={setPage}
            totalCount={totalCount}
            displayCount={registrations.length}
          />
        </CardContent>
      </Card>
    </div>
  );
}
