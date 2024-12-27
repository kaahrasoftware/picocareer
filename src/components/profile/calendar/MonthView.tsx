import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

interface MonthViewProps {
  date: Date;
  onSelectDate: (date: Date | undefined) => void;
  hasAvailability: (date: Date) => boolean;
}

export function MonthView({
  date,
  onSelectDate,
  hasAvailability
}: MonthViewProps) {
  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={onSelectDate}
      className="rounded-md border bg-background"
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
  );
}