
import React from 'react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface TimeSlot {
  time: string;
  available: boolean;
  timezoneOffset?: number;
}

interface TimeSlotSelectorProps {
  selectedTime: string;
  onTimeChange: (time: string) => void;
  interval?: number;
  showTimeSlots?: boolean;
  duration?: number;
  timeSlots?: TimeSlot[];
  isLoading?: boolean;
}

export function TimeSlotSelector({
  selectedTime,
  onTimeChange,
  interval = 30,
  showTimeSlots = false,
  duration = 60,
  timeSlots = [],
  isLoading = false
}: TimeSlotSelectorProps) {

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full" />
        ))}
      </div>
    );
  }

  if (timeSlots.length > 0) {
    return (
      <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto p-1">
        {timeSlots.map((slot) => (
          <button
            key={slot.time}
            className={cn(
              "px-3 py-2 rounded-md text-sm font-medium",
              selectedTime === slot.time
                ? "bg-primary text-primary-foreground"
                : "bg-accent text-accent-foreground hover:bg-accent/80",
              !slot.available && "opacity-50 cursor-not-allowed bg-muted hover:bg-muted"
            )}
            disabled={!slot.available}
            onClick={() => slot.available && onTimeChange(slot.time)}
          >
            {slot.time}
          </button>
        ))}
        {timeSlots.length === 0 && (
          <div className="col-span-2 text-center py-4 text-muted-foreground">
            No available time slots
          </div>
        )}
      </div>
    );
  }

  // Generate time slots if none are provided
  const generateTimeSlots = () => {
    const slots = [];
    const totalMinutesInDay = 24 * 60;
    
    for (let minute = 0; minute < totalMinutesInDay; minute += interval) {
      const hours = Math.floor(minute / 60);
      const mins = minute % 60;
      const timeStr = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
      slots.push(timeStr);
    }
    
    return slots;
  };

  const slots = showTimeSlots ? generateTimeSlots() : [];

  return (
    <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto p-1">
      {slots.map((time) => (
        <button
          key={time}
          className={cn(
            "px-3 py-2 rounded-md text-sm font-medium",
            selectedTime === time
              ? "bg-primary text-primary-foreground"
              : "bg-accent text-accent-foreground hover:bg-accent/80"
          )}
          onClick={() => onTimeChange(time)}
        >
          {time}
        </button>
      ))}
    </div>
  );
}
