
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import type { Event } from '@/hooks/useEvents';

interface EventSelectorProps {
  events: Event[];
  selectedEvent: string;
  onEventChange: (eventId: string) => void;
  registrationCounts: Record<string, number>;
  isLoading?: boolean;
}

export const EventSelector: React.FC<EventSelectorProps> = ({
  events,
  selectedEvent,
  onEventChange,
  registrationCounts,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading events...</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Select value={selectedEvent} onValueChange={onEventChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select an event" />
        </SelectTrigger>
        <SelectContent>
          {events.length === 0 ? (
            <SelectItem value="none" disabled>
              No events available
            </SelectItem>
          ) : (
            events.map((event) => (
              <SelectItem key={event.id} value={event.id}>
                <div className="flex items-center justify-between w-full">
                  <span>{event.title}</span>
                  <div className="flex items-center gap-2 ml-2">
                    <Badge variant="outline" className="text-xs">
                      {registrationCounts[event.id] || 0} registered
                    </Badge>
                    <Badge 
                      variant={event.status === 'Approved' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {event.status}
                    </Badge>
                  </div>
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
