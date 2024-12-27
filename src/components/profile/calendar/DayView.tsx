import React from "react";
import { format } from "date-fns";
import { EventList } from "./EventList";

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
    <div className="p-6">
      <h3 className="text-lg font-medium mb-6">
        {format(date, 'EEEE, MMMM d, yyyy')}
      </h3>
      <div className="space-y-2">
        <EventList 
          events={events} 
          availability={availability}
          isMentor={isMentor}
          onEventClick={onEventClick}
        />
      </div>
    </div>
  );
}