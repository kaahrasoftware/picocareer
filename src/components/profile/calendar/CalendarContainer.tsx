import { format } from "date-fns";
import { CalendarView } from "./CalendarView";
import { EventsSidebar } from "./EventsSidebar";
import { useSessionEvents } from "@/hooks/useSessionEvents";
import type { Availability } from "@/types/calendar";

export function CalendarContainer() {
  const { data: events = [], data: availabilitySlots = [] } = useSessionEvents();

  const formatEventTime = (slot: Availability) => {
    return format(new Date(slot.start_date_time), "h:mm a");
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      <div className="flex-1">
        <CalendarView 
          events={events} 
          availability={availabilitySlots} 
          selectedDate={new Date()} 
          setSelectedDate={() => {}}
        />
      </div>
      <div className="w-full lg:w-80">
        <EventsSidebar 
          events={events} 
          availability={availabilitySlots}
          formatEventTime={formatEventTime}
        />
      </div>
    </div>
  );
}