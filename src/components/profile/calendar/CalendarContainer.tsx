import { useState } from "react";
import { CalendarView } from "./CalendarView";
import { EventsSidebar } from "./EventsSidebar";
import { useSessionEvents } from "@/hooks/useSessionEvents";
import { format } from "date-fns";
import type { TimeSlot, CalendarEvent } from "@/types/session";

interface CalendarContainerProps {
  availabilitySlots: TimeSlot[];
  onDeleteAvailability: (id: string) => void;
}

export function CalendarContainer({ 
  availabilitySlots,
  onDeleteAvailability 
}: CalendarContainerProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { data: events = [], isLoading } = useSessionEvents();

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  // Filter availability slots for the selected date
  const filteredAvailability = availabilitySlots.filter(slot => {
    const slotDate = new Date(slot.start_date_time);
    return format(slotDate, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
  });

  return (
    <div className="flex flex-col md:flex-row gap-4 h-full">
      <div className="flex-1">
        <CalendarView
          isMentor={true}
          events={events}
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          availabilitySlots={filteredAvailability}
          isLoading={isLoading}
        />
      </div>
      <div className="w-full md:w-80">
        <EventsSidebar
          selectedDate={selectedDate}
          events={events}
          isMentor={true}
          onEventDelete={() => {}}
        />
      </div>
    </div>
  );
}