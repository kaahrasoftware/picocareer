import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Availability } from "@/types/calendar";

interface CalendarContainerProps {
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  availability: Availability[];
}

export function CalendarContainer({ selectedDate, setSelectedDate, availability }: CalendarContainerProps) {
  // Function to determine if a date has availability set
  const hasAvailability = (date: Date) => {
    return availability?.some(slot => 
      slot.date_available === format(date, 'yyyy-MM-dd') && slot.is_available
    );
  };

  return (
    <div className="w-fit">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={setSelectedDate}
        className="rounded-md border bg-kahra-darker"
        modifiers={{
          hasAvailability: (date) => hasAvailability(date)
        }}
        modifiersStyles={{
          hasAvailability: {
            border: '2px solid #22c55e',
            borderRadius: '4px'
          }
        }}
      />
    </div>
  );
}