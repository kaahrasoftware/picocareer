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
    <div className="space-y-4">
      <h3 className="font-medium">
        Events for {format(date, 'MMMM d, yyyy')}
      </h3>
      <EventList 
        events={events} 
        availability={availability}
        isMentor={isMentor}
        onEventClick={onEventClick}
      />
    </div>
  );
}