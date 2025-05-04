
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExportButton } from './events/ExportButton';
import { RegistrationsTable } from './events/RegistrationsTable';
import { RegistrationsSearchFilters } from './events/RegistrationsSearchFilters';
import { RegistrationsPagination } from './events/RegistrationsPagination';
import { useEventRegistrations } from './events/useEventRegistrations';

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
    setSearchQuery
  } = useEventRegistrations();

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Event Registrations</h2>
        <ExportButton 
          selectedEvent={selectedEvent}
          searchQuery={searchQuery}
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>All Registrations</CardTitle>
        </CardHeader>
        <CardContent>
          <RegistrationsSearchFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedEvent={selectedEvent}
            onEventChange={setSelectedEvent}
            events={events}
            isLoading={isLoading}
          />

          <RegistrationsTable 
            registrations={registrations}
            isLoading={isRegistrationsLoading}
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
