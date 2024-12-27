import React from "react";
import { format } from "date-fns";
import { TimeGrid } from "./TimeGrid";

interface DayViewProps {
  date: Date;
  events: any[];
  availability?: any[];
  isMentor?: boolean;
  onEventClick?: (event: any) => void;
}

export function DayView({
  date,
  events,
  availability = [],
  isMentor = false,
  onEventClick
}: DayViewProps) {
  return (
    <div className="flex flex-col h-full bg-background">
      <div className="text-center py-4 border-b">
        <div className="text-sm text-gray-500">{format(date, "EEEE")}</div>
        <div className="text-2xl font-semibold">{format(date, "MMMM d, yyyy")}</div>
      </div>
      
      <TimeGrid 
        events={events} 
        date={date}
        startHour={6}
        endHour={22}
      />
    </div>
  );
}