import React from 'react';
import { formatInTimeZone } from 'date-fns-tz';
import { Availability } from "@/types/calendar";

interface AvailabilitySlotProps {
  slot: Availability;
  date: Date;
  timezone: string;
  index: number;
  cellHeight: number;
}

export function AvailabilitySlot({ slot, date, timezone, index, cellHeight }: AvailabilitySlotProps) {
  const getSlotPosition = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    // Add one cellHeight to move the slot down one row
    return (hours * cellHeight * 2 + (minutes / 30) * cellHeight) + cellHeight;
  };

  const calculateSlotHeight = (startTime: string, endTime: string) => {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    const diffInMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
    return (diffInMinutes / 30) * cellHeight;
  };

  const slotDate = new Date(date);
  const [startHour, startMinute] = slot.start_time.split(':').map(Number);
  slotDate.setHours(startHour, startMinute);

  return (
    <div
      key={`${slot.date_available}-${slot.start_time}-${index}`}
      className="absolute left-2 right-2 p-3 rounded-lg border border-purple-500/30 bg-purple-500/20 hover:bg-purple-500/30 hover:border-purple-500/40 transition-colors"
      style={{
        top: `${getSlotPosition(slot.start_time)}px`,
        height: `${calculateSlotHeight(slot.start_time, slot.end_time)}px`,
        zIndex: 5
      }}
    >
      <div className="flex flex-col gap-1">
        <h4 className="font-medium text-sm leading-tight truncate">
          Available for Booking
        </h4>
        <span className="text-xs text-muted-foreground">
          {formatInTimeZone(slotDate, timezone, 'h:mm a')} - 
          {formatInTimeZone(
            new Date(slotDate).setHours(
              parseInt(slot.end_time.split(':')[0]), 
              parseInt(slot.end_time.split(':')[1])
            ),
            timezone,
            ' h:mm a'
          )}
        </span>
      </div>
    </div>
  );
}