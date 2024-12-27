import React from 'react';
import { formatInTimeZone } from 'date-fns-tz';

interface TimeGridProps {
  timezone: string;
  cellHeight: number;
}

export function TimeGrid({ timezone, cellHeight }: TimeGridProps) {
  // Generate time slots from 00:00 to 23:30 in 30-minute increments
  const timeSlots = Array.from({ length: 48 }, (_, i) => {
    const date = new Date();
    date.setHours(Math.floor(i / 2), (i % 2) * 30, 0, 0);
    return formatInTimeZone(date, timezone, 'h:mm a');
  });

  return (
    <div className="relative">
      {timeSlots.map((time, index) => (
        <div
          key={time}
          className="text-sm text-muted-foreground"
          style={{ 
            height: `${cellHeight}px`,
            lineHeight: `${cellHeight}px`
          }}
        >
          {time}
        </div>
      ))}
    </div>
  );
}