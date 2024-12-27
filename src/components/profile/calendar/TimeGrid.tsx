import React from 'react';
import { formatInTimeZone } from 'date-fns-tz';

interface TimeGridProps {
  timezone: string;
}

export function TimeGrid({ timezone }: TimeGridProps) {
  // Generate time slots from 12 AM to 11:30 PM in 30-minute increments
  const timeSlots = Array.from({ length: 48 }, (_, i) => {
    const date = new Date();
    date.setHours(Math.floor(i / 2), (i % 2) * 30, 0, 0);
    return formatInTimeZone(date, timezone, 'h:mm a');
  });

  return (
    <div className="space-y-[26px] pt-6">
      {timeSlots.map((time) => (
        <div key={time} className="text-sm text-muted-foreground">
          {time}
        </div>
      ))}
    </div>
  );
}