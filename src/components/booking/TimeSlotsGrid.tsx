
import { ScrollArea } from "@/components/ui/scroll-area";
import { TimeSlotButton } from "./TimeSlotButton";
import { memo, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

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
  isLoading?: boolean;
}

export const TimeSlotsGrid = memo(function TimeSlotsGrid({ 
  title,
  timeSlots, 
  selectedTime, 
  onTimeSelect,
  mentorTimezone,
  date,
  isLoading = false
}: TimeSlotsGridProps) {
  const { availableSlots, morningSlots, afternoonSlots, eveningSlots } = useMemo(() => {
    const available = timeSlots.filter(slot => slot.available);
    
    // Group slots by time of day
    const morning = timeSlots.filter(slot => {
      const hour = parseInt(slot.time.split(':')[0]);
      return hour >= 0 && hour < 12;
    });
    
    const afternoon = timeSlots.filter(slot => {
      const hour = parseInt(slot.time.split(':')[0]);
      return hour >= 12 && hour < 17;
    });
    
    const evening = timeSlots.filter(slot => {
      const hour = parseInt(slot.time.split(':')[0]);
      return hour >= 17 && hour < 24;
    });
    
    return {
      availableSlots: available,
      morningSlots: morning,
      afternoonSlots: afternoon,
      eveningSlots: evening
    };
  }, [timeSlots]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <h4 className="font-medium mb-2">{title}</h4>
        <div className="h-[250px] rounded-md border p-3">
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="w-full h-10" />
            ))}
          </div>
        </div>
      </div>
    );
  }

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

  const renderTimeSection = (slots: TimeSlot[], title: string) => {
    if (slots.length === 0) return null;
    
    return (
      <div className="mb-3">
        <h5 className="text-xs font-medium text-muted-foreground mb-2">{title}</h5>
        <div className="space-y-1.5">
          {slots.map((slot) => (
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
      </div>
    );
  };

  return (
    <div>
      <h4 className="font-medium mb-2">{title}</h4>
      <ScrollArea className="h-[250px] rounded-md border">
        <div className="p-3">
          {renderTimeSection(morningSlots, "Morning")}
          {renderTimeSection(afternoonSlots, "Afternoon")}
          {renderTimeSection(eveningSlots, "Evening")}
        </div>
      </ScrollArea>
    </div>
  );
});
