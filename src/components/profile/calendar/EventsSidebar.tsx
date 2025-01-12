import { format } from "date-fns";
import { EventList } from "./EventList";
import type { Availability, CalendarEvent } from "@/types/session";

interface EventsSidebarProps {
  selectedDate: Date;
  events: CalendarEvent[];
  availabilitySlots: Availability[];
  onDeleteAvailability: (id: string) => void;
  isLoading: boolean;
}

export function EventsSidebar({
  selectedDate,
  events,
  availabilitySlots,
  onDeleteAvailability,
  isLoading
}: EventsSidebarProps) {
  return (
    <div className="p-4 border rounded-lg bg-card">
      <h3 className="font-semibold mb-4">
        Events for {format(selectedDate, "MMMM d, yyyy")}
      </h3>
      <EventList
        events={events}
        availabilitySlots={availabilitySlots}
        onDeleteAvailability={onDeleteAvailability}
        isLoading={isLoading}
      />
    </div>
  );
}