
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

interface EventSelectProps {
  eventId: string;
  setEventId: (id: string) => void;
  events: Array<{ id: string; title: string; registrations_count?: number }>;
  isLoading: boolean;
}

export function EventSelect({ eventId, setEventId, events, isLoading }: EventSelectProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label>Select Event</Label>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>Select Event</Label>
      <Select 
        value={eventId}
        onValueChange={setEventId}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select an event" />
        </SelectTrigger>
        <SelectContent>
          {events.length === 0 ? (
            <SelectItem value="none" disabled>No events found</SelectItem>
          ) : (
            events.map(event => (
              <SelectItem key={event.id} value={event.id}>
                {event.title} {event.registrations_count && `(${event.registrations_count} registrants)`}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
