import { useState } from "react";
import { CalendarView } from "./CalendarView";
import { EventsSidebar } from "./EventsSidebar";
import { useSessionEvents } from "@/hooks/useSessionEvents";
import type { Availability, CalendarEvent } from "@/types/session";

export function CalendarContainer({ 
  availabilitySlots,
  events 
}: { 
  availabilitySlots: Availability[];
  events: CalendarEvent[];
}) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { isLoading } = useSessionEvents();

  const filteredSlots = availabilitySlots.filter(slot => {
    if (!slot.start_time) return false;
    const slotDate = new Date(slot.start_time);
    return (
      slotDate.getDate() === selectedDate.getDate() &&
      slotDate.getMonth() === selectedDate.getMonth() &&
      slotDate.getFullYear() === selectedDate.getFullYear()
    );
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="md:col-span-3">
        <CalendarView 
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          availabilitySlots={availabilitySlots}
          events={events}
          isLoading={isLoading}
        />
      </div>
      <div>
        <EventsSidebar 
          selectedDate={selectedDate}
          availabilitySlots={filteredSlots}
          events={events}
        />
      </div>
    </div>
  );
}