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
    const dateStr = format(date, 'yyyy-MM-dd');
    return availability?.some(slot => {
      if (slot.recurring) {
        return slot.day_of_week === date.getDay();
      }
      return format(new Date(slot.start_date_time), 'yyyy-MM-dd') === dateStr && slot.is_available;
    });
  };

  return (
    <div className="w-fit">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={setSelectedDate}
        defaultMonth={selectedDate} // Add this line to maintain the selected month
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