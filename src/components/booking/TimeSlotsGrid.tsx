
import { memo, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TimeSlotButton } from "./TimeSlotButton";

interface TimeSlot {
  time: string;
  available: boolean;
  timezoneOffset?: number;
  originalDateTime?: Date;
}

interface TimeSlotsGridProps {
  title: string;
  timeSlots: TimeSlot[];
  selectedTime: string | undefined;
  onTimeSelect: (time: string) => void;
  mentorTimezone: string;
  date: Date;
}

// Use memo to prevent unnecessary re-renders
export const TimeSlotsGrid = memo(function TimeSlotsGrid({ 
  title,
  timeSlots, 
  selectedTime, 
  onTimeSelect,
  mentorTimezone,
  date
}: TimeSlotsGridProps) {
  // Memoize the filtered slots to prevent recalculation on re-renders
  const availableSlots = useMemo(() => 
    timeSlots.filter(slot => slot.available), 
    [timeSlots]
  );

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
      <h4 className="font-medium mb-2 text-sm sm:text-base">{title}</h4>
      <ScrollArea className="h-[200px] sm:h-[250px] rounded-md border">
        <div className="flex flex-col gap-1 p-2 sm:gap-1.5 sm:p-3">
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
              originalDateTime={slot.originalDateTime}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}, (prevProps, nextProps) => {
  // Improved comparison function to prevent unnecessary re-renders
  // First check shallow props that are most likely to change
  if (prevProps.selectedTime !== nextProps.selectedTime || 
      prevProps.title !== nextProps.title || 
      prevProps.mentorTimezone !== nextProps.mentorTimezone) {
    return false; // Props changed, should re-render
  }
  
  // Check date (common source of re-renders)
  if (prevProps.date.getTime() !== nextProps.date.getTime()) {
    return false; // Date changed, should re-render
  }
  
  // Check timeSlots length first (quick check)
  if (prevProps.timeSlots.length !== nextProps.timeSlots.length) {
    return false; // Length changed, should re-render
  }
  
  // Check actual slot contents (more expensive)
  // Only do this check if everything else matches
  for (let i = 0; i < prevProps.timeSlots.length; i++) {
    const prevSlot = prevProps.timeSlots[i];
    const nextSlot = nextProps.timeSlots[i];
    
    if (prevSlot.time !== nextSlot.time || 
        prevSlot.available !== nextSlot.available) {
      return false; // Slot changed, should re-render
    }
  }
  
  return true; // No changes, don't re-render
});
