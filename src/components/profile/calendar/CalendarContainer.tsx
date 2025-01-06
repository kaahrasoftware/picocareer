import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Availability } from "@/types/calendar";
import type { CalendarEvent } from "@/types/calendar";

interface CalendarContainerProps {
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  availability: Availability[];
  events?: CalendarEvent[];
}

export function CalendarContainer({ 
  selectedDate, 
  setSelectedDate, 
  availability,
  events = [] 
}: CalendarContainerProps) {
  // Function to determine if a date has sessions
  const hasSessionsOnDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return events.some(event => format(new Date(event.start_time), 'yyyy-MM-dd') === dateStr);
  };

  return (
    <div className="w-fit">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={setSelectedDate}
        defaultMonth={selectedDate}
        className="rounded-md border bg-kahra-darker"
        modifiers={{
          sessions: hasSessionsOnDate
        }}
        modifiersStyles={{
          sessions: {
            border: '2px solid #3b82f6',
            borderRadius: '4px'
          }
        }}
      />
    </div>
  );
}