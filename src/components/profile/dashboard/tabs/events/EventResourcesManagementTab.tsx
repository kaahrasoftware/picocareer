
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle, Calendar } from 'lucide-react';
import { EventResourceCard } from '@/components/event/EventResourceCard';
import { EventResourceForm } from '@/components/event/EventResourceForm';
import { EventSelector } from './EventSelector';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { useEventResources } from '@/hooks/useEventResources';
import { useEvents } from '@/hooks/useEvents';

interface EventResourcesManagementTabProps {
  eventId?: string;
}

export const EventResourcesManagementTab: React.FC<EventResourcesManagementTabProps> = ({ eventId: initialEventId }) => { 
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selectedEventId, setSelectedEventId] = useState(initialEventId || '');

  // Fetch events for the selector
  const { events, registrationCounts, isLoading: eventsLoading } = useEvents();

  // Fetch resources for the selected event
  const { resources, isLoading: resourcesLoading } = useEventResources(selectedEventId);

  const handleEventChange = (eventId: string) => {
    setSelectedEventId(eventId);
  };

  const selectedEvent = events?.find(event => event.id === selectedEventId);

  return (
    <div className="space-y-6">
      {/* Event Selector Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Select Event
          </CardTitle>
          <CardDescription>
            Choose an event to manage its resources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EventSelector
            events={events || []}
            selectedEvent={selectedEventId}
            onEventChange={handleEventChange}
            registrationCounts={registrationCounts}
            isLoading={eventsLoading}
          />
        </CardContent>
      </Card>

      {/* Selected Event Info & Actions */}
      {selectedEvent && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>{selectedEvent.title}</CardTitle>
                <CardDescription>
                  {selectedEvent.start_time && new Date(selectedEvent.start_time).toLocaleDateString()} • {selectedEvent.location || 'Virtual'}
                </CardDescription>
              </div>
              <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Resource
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Add New Resource</DialogTitle>
                  </DialogHeader>
                  <EventResourceForm eventId={selectedEventId} onSuccess={() => setIsFormOpen(false)} />
                </DialogContent> 
              </Dialog>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Resources Section */}
      {selectedEventId ? (
        <>
          {resourcesLoading ? (
            <Card className="w-full text-center py-8">
              <CardContent>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Loading resources...</p>
              </CardContent>
            </Card>
          ) : resources && resources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resources.map((resource) => (
                <EventResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          ) : (
            <Card className="w-full text-center py-8">
              <CardHeader>
                <CardTitle>No Resources Found</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  There are no resources available for this event yet. Add a new resource to get started.
                </CardDescription>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card className="w-full text-center py-8">
          <CardHeader>
            <CardTitle>Select an Event</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Please select an event from the dropdown above to view and manage its resources.
            </CardDescription>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
