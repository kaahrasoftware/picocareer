import React from "react";
import { format, eachDayOfInterval, startOfWeek, endOfWeek } from "date-fns";
import { TimeGrid } from "./TimeGrid";

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
    <div className="flex flex-col h-full bg-background">
      <div className="grid grid-cols-7 border-b">
        {daysInWeek.map((day) => (
          <div
            key={day.toISOString()}
            className="flex flex-col items-center py-2 border-r last:border-r-0"
          >
            <div className="text-sm text-gray-500">{format(day, "EEE")}</div>
            <div className="text-xl font-semibold">{format(day, "d")}</div>
          </div>
        ))}
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