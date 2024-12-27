import React from 'react';
import { formatInTimeZone } from 'date-fns-tz';
import { Availability } from '@/types/calendar';

interface AvailabilityBlockProps {
  slot: Availability;
  index: number;
  date: Date;
  timezone: string;
}

export const AvailabilityBlock = ({ slot, index, date, timezone }: AvailabilityBlockProps) => {
  const getEventPosition = (time: string) => {
    try {
      const [hours, minutes] = time.split(':').map(Number);
      return `${(hours * 60) + minutes}px`;
    } catch (error) {
      console.error('Error calculating position for time:', time, error);
      return '0px';
    }
  };

  const calculateSlotHeight = (startTime: string, endTime: string) => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const diffInMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    return `${diffInMinutes}px`;
  };

  const slotDate = new Date(date);
  const [startHour, startMinute] = slot.start_time.split(':').map(Number);
  const [endHour, endMinute] = slot.end_time.split(':').map(Number);
  
  slotDate.setHours(startHour, startMinute);
  const startTimeInUserTz = formatInTimeZone(slotDate, timezone, 'HH:mm');

  return (
    <div
      key={`${slot.date_available}-${slot.start_time}-${index}`}
      className="absolute left-2 right-2 p-3 rounded-lg border border-purple-500/30 bg-purple-500/20 hover:bg-purple-500/30 hover:border-purple-500/40 transition-colors"
      style={{
        top: getEventPosition(startTimeInUserTz),
        height: calculateSlotHeight(slot.start_time, slot.end_time),
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
            new Date(slotDate).setHours(endHour, endMinute),
            timezone,
            'h:mm a'
          )}
        </span>
      </div>
    </div>
  );
};