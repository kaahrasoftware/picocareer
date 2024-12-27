import React from "react";
import { format } from "date-fns";

interface TimeGridProps {
  startHour?: number;
  endHour?: number;
  events: any[];
  date: Date;
}

export function TimeGrid({ startHour = 0, endHour = 23, events, date }: TimeGridProps) {
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="relative min-h-[1200px] border-t border-gray-200">
        {hours.map((hour) => (
          <div
            key={hour}
            className="absolute w-full border-b border-gray-200"
            style={{ top: `${(hour - startHour) * 50}px`, height: "50px" }}
          >
            <div className="sticky left-0 w-[60px] -mt-3 pr-2 text-right text-sm text-gray-500">
              {format(new Date().setHours(hour, 0, 0, 0), "ha")}
            </div>
          </div>
        ))}
        
        {events.map((event, index) => {
          const startTime = new Date(event.start_time);
          const endTime = new Date(event.end_time);
          const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
          const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
          
          return (
            <div
              key={index}
              className="absolute left-[60px] right-0 bg-primary/20 rounded-lg p-2 overflow-hidden"
              style={{
                top: `${(startMinutes / 60 - startHour) * 50}px`,
                height: `${(duration / 60) * 50}px`,
                width: "calc(100% - 60px)"
              }}
            >
              <div className="text-sm font-medium text-primary">{event.title}</div>
              <div className="text-xs text-gray-600">
                {format(startTime, "h:mma")} - {format(endTime, "h:mma")}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}