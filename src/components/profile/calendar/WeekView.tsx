import React from "react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { EventList } from "./EventList";

interface WeekViewProps {
  date: Date;
  events: any[];
  availability?: any[];
  isMentor?: boolean;
  onEventClick?: (event: any) => void;
}

export function WeekView({
  date,
  events,
  availability = [],
  isMentor = false,
  onEventClick
}: WeekViewProps) {
  const weekStart = startOfWeek(date);
  const weekEnd = endOfWeek(date);
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  return (
    <div className="space-y-6">
      {daysInWeek.map((day) => {
        const dayEvents = events.filter(event => {
          const eventDate = new Date(event.start_time);
          return format(eventDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
        });

        const dayAvailability = availability.filter(slot => 
          slot.date_available === format(day, 'yyyy-MM-dd')
        );

        return (
          <div key={day.toISOString()} className="space-y-2">
            <h3 className="font-medium">
              {format(day, 'EEEE, MMMM d')}
            </h3>
            <EventList 
              events={dayEvents} 
              availability={dayAvailability}
              isMentor={isMentor}
              onEventClick={onEventClick}
            />
          </div>
        );
      })}
    </div>
  );
}