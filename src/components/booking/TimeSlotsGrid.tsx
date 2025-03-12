
import { ScrollArea } from "@/components/ui/scroll-area";
import { TimeSlotButton } from "./TimeSlotButton";
import { memo } from "react";

interface TimeSlot {
  time: string;
  available: boolean;
  timezoneOffset?: number;
}

interface TimeSlotsGridProps {
  title: string;
  timeSlots: TimeSlot[];
  selectedTime: string | undefined;
  onTimeSelect: (time: string) => void;
  mentorTimezone: string;
  date: Date;
}

export const TimeSlotsGrid = memo(function TimeSlotsGrid({ 
  title,
  timeSlots, 
  selectedTime, 
  onTimeSelect,
  mentorTimezone,
  date
}: TimeSlotsGridProps) {
  const availableSlots = timeSlots.filter(slot => slot.available);

  if (timeSlots.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-4 bg-muted/5 rounded-md border">
        No available time slots for this date
      </div>
    );
  }

  if (availableSlots.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-4 bg-muted/5 rounded-md border">
        All time slots are booked for this date
      </div>
    );
  }

  return (
    <div>
      <h4 className="font-medium mb-2">{title}</h4>
      <ScrollArea className="h-[250px] rounded-md border">
        <div className="flex flex-col gap-1.5 p-3">
          {timeSlots.map((slot) => (
            <TimeSlotButton
              key={slot.time}
              time={slot.time}
              available={slot.available}
              isSelected={selectedTime === slot.time}
              onSelect={onTimeSelect}
              mentorTimezone={mentorTimezone}
              date={date}
              timezoneOffset={slot.timezoneOffset}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
});
