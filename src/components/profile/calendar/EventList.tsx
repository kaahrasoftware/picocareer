import { format } from "date-fns";
import type { Availability, CalendarEvent } from "@/types/session";

export function EventList({ 
  events,
  availabilitySlots 
}: { 
  events: CalendarEvent[];
  availabilitySlots: Availability[];
}) {
  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );

  const sortedSlots = [...availabilitySlots].sort((a, b) => {
    if (!a.start_time || !b.start_time) return 0;
    return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
  });

  return (
    <div className="space-y-4">
      {sortedEvents.map(event => (
        <div key={event.id} className="p-3 bg-background border rounded-lg">
          <h4 className="font-medium">{event.title}</h4>
          <p className="text-sm text-muted-foreground">
            {format(new Date(event.start_time), 'h:mm a')} - 
            {format(new Date(event.end_time), 'h:mm a')}
          </p>
        </div>
      ))}
      
      {sortedSlots.map(slot => (
        <div key={slot.id} className="p-3 bg-background border rounded-lg">
          <h4 className="font-medium">Available Slot</h4>
          {slot.start_time && slot.end_time && (
            <p className="text-sm text-muted-foreground">
              {format(new Date(slot.start_time), 'h:mm a')} - 
              {format(new Date(slot.end_time), 'h:mm a')}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}