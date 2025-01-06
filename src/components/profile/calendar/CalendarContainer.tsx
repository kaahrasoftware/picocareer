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
        className="rounded-md border"
        modifiers={{
          available: (date) => getDateStatus(date) === 'available',
          unavailable: (date) => getDateStatus(date) === 'unavailable',
          mixed: (date) => getDateStatus(date) === 'mixed'
        }}
        modifiersStyles={{
          available: {
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            border: '2px solid rgb(34, 197, 94)',
            borderRadius: '4px',
            color: 'rgb(34, 197, 94)'
          },
          unavailable: {
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '2px solid rgb(239, 68, 68)',
            borderRadius: '4px',
            color: 'rgb(239, 68, 68)'
          },
          mixed: {
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            border: '2px solid rgb(245, 158, 11)',
            borderRadius: '4px',
            color: 'rgb(245, 158, 11)'
          }
        }}
      />
    </div>
  );
}