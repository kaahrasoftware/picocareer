import React from 'react';
import { formatInTimeZone } from 'date-fns-tz';

interface TimeGridProps {
  timezone: string;
}

export const TimeGrid = ({ timezone }: TimeGridProps) => {
  // Generate time slots from 12 AM to 11 PM
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    return formatInTimeZone(
      new Date().setHours(i, 0, 0, 0),
      timezone,
      'h a'
    );
  });

  return (
    <>
      <div className="space-y-[52px] pt-6">
        {timeSlots.map((time) => (
          <div key={time} className="text-sm text-muted-foreground">
            {time}
          </div>
        ))}
      </div>
      <div className="relative border-l border-border min-h-[1440px]">
        {timeSlots.map((_, index) => (
          <div
            key={index}
            className="absolute w-full border-t border-border/30"
            style={{ top: `${index * 60}px` }}
          />
        ))}
      </div>
    </>
  );
};