
import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon } from 'lucide-react';

interface EventSelectorProps {
  events: any[];
  selectedEvent: string;
  onEventChange: (value: string) => void;
  registrationCounts: Record<string, number>;
  isLoading: boolean;
}

export function EventSelector({
  events,
  selectedEvent,
  onEventChange,
  registrationCounts,
  isLoading
}: EventSelectorProps) {
  return (
    <div className="flex items-center gap-2 w-full sm:w-1/2">
      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
      <Select
        value={selectedEvent}
        onValueChange={onEventChange}
        disabled={isLoading}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select an event" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <div className="flex justify-between items-center w-full">
              <span>All Events</span>
              <Badge variant="outline">
                {Object.values(registrationCounts).reduce((a, b) => a + b, 0)}
              </Badge>
            </div>
          </SelectItem>
          
          {events.map(event => (
            <SelectItem key={event.id} value={event.id}>
              <div className="flex justify-between items-center w-full">
                <span>{event.title || 'Untitled Event'}</span>
                {registrationCounts[event.id] && (
                  <Badge variant="outline">{registrationCounts[event.id]}</Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
