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
    <div className="p-6">
      <Calendar
        mode="single"
        selected={date}
        onSelect={onSelectDate}
        className="w-full rounded-md border-0"
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