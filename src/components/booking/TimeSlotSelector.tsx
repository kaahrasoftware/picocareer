
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useAvailableTimeSlots } from "@/hooks/useAvailableTimeSlots";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface BookingSessionType {
  id: string;
  type: string;
  duration: number;
  price: number;
  description?: string;
  meeting_platform: string[];
}

interface TimeSlotSelectorProps {
  date: Date;
  mentorId: string;
  selectedTime: string | undefined;
  onTimeSelect: (time: string) => void;
  selectedSessionType: BookingSessionType | null;
}

export function TimeSlotSelector({
  date,
  mentorId,
  selectedTime,
  onTimeSelect,
  selectedSessionType
}: TimeSlotSelectorProps) {
  const sessionDuration = selectedSessionType?.duration || 60;
  
  const { timeSlots, isLoading, error } = useAvailableTimeSlots(
    date,
    mentorId,
    sessionDuration
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-2">Available Time Slots</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-2">Available Time Slots</h3>
        <div className="text-center py-8 text-muted-foreground">
          Error loading time slots. Please try again.
        </div>
      </div>
    );
  }

  if (!timeSlots || timeSlots.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-2">Available Time Slots</h3>
        <div className="text-center py-8 text-muted-foreground">
          No available time slots for this date.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-2">Available Time Slots</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {timeSlots.map((slot) => (
          <Card
            key={slot.time}
            className={cn(
              "cursor-pointer transition-colors",
              selectedTime === slot.time
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted',
              !slot.available && 'opacity-50 cursor-not-allowed'
            )}
            onClick={() => slot.available && onTimeSelect(slot.time)}
          >
            <CardContent className="p-3 text-center">
              <span className="text-sm font-medium">{slot.time}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
