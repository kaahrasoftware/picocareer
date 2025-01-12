import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { Availability, CalendarEvent } from "@/types/session";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EventListProps {
  events: CalendarEvent[];
  availabilitySlots: Availability[];
  onDeleteAvailability: (id: string) => void;
  isLoading: boolean;
}

export function EventList({ 
  events, 
  availabilitySlots, 
  onDeleteAvailability,
  isLoading 
}: EventListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-20 bg-muted animate-pulse rounded-lg" />
        <div className="h-20 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (events.length === 0 && availabilitySlots.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          No events or availability slots for this day
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div
          key={event.id}
          className="p-4 rounded-lg border bg-card text-card-foreground"
        >
          <h4 className="font-medium">{event.title}</h4>
          <p className="text-sm text-muted-foreground">
            {format(new Date(event.start_time), "h:mm a")} -{" "}
            {format(new Date(event.end_time), "h:mm a")}
          </p>
          {event.description && (
            <p className="text-sm mt-2">{event.description}</p>
          )}
        </div>
      ))}

      {availabilitySlots.map((slot) => (
        <div
          key={slot.id}
          className="p-4 rounded-lg border bg-card text-card-foreground"
        >
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium">Available Time Slot</h4>
              <p className="text-sm text-muted-foreground">
                {format(new Date(slot.start_time), "h:mm a")} -{" "}
                {format(new Date(slot.end_time), "h:mm a")}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDeleteAvailability(slot.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}