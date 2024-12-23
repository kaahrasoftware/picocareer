import { ScrollArea } from "@/components/ui/scroll-area";
import { TimeSlotButton } from "./TimeSlotButton";

interface TimeSlot {
  time: string;
  available: boolean;
}

interface TimeSlotsGridProps {
  timeSlots: TimeSlot[];
  selectedTime: string | undefined;
  onTimeSelect: (time: string) => void;
}

export function TimeSlotsGrid({ 
  timeSlots, 
  selectedTime, 
  onTimeSelect 
}: TimeSlotsGridProps) {
  if (timeSlots.length === 0) {
    return (
      <div className="col-span-2 text-center text-gray-500 py-4">
        No available time slots for this date
      </div>
    );
  }

  return (
    <ScrollArea className="h-[200px] rounded-md border border-kahra-darker">
      <div className="grid grid-cols-2 gap-2 p-4">
        {timeSlots.map((slot) => (
          <TimeSlotButton
            key={slot.time}
            time={slot.time}
            available={slot.available}
            isSelected={selectedTime === slot.time}
            onSelect={onTimeSelect}
          />
        ))}
      </div>
    </ScrollArea>
  );
}