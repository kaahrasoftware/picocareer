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
  const getDateStatus = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    let hasAvailable = false;
    let hasUnavailable = false;

    availability?.forEach(slot => {
      if (slot.recurring) {
        if (slot.day_of_week === date.getDay()) {
          if (slot.is_available) {
            hasAvailable = true;
          } else {
            hasUnavailable = true;
          }
        }
      } else {
        if (format(new Date(slot.start_date_time), 'yyyy-MM-dd') === dateStr) {
          if (slot.is_available) {
            hasAvailable = true;
          } else {
            hasUnavailable = true;
          }
        }
      }
    });

    if (hasAvailable && hasUnavailable) return 'mixed';
    if (hasAvailable) return 'available';
    if (hasUnavailable) return 'unavailable';
    return null;
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
          available: (date) => getDateStatus(date) === 'available',
          unavailable: (date) => getDateStatus(date) === 'unavailable',
          mixed: (date) => getDateStatus(date) === 'mixed'
        }}
        modifiersStyles={{
          available: {
            border: '2px solid #22c55e',
            borderRadius: '4px'
          },
          unavailable: {
            border: '2px solid #ef4444',
            borderRadius: '4px'
          },
          mixed: {
            border: '2px solid #f59e0b',
            borderRadius: '4px'
          }
        }}
      />
    </div>
  );
}