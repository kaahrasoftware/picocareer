import { ScrollArea } from "@/components/ui/scroll-area";
import { TimeSlotButton } from "./TimeSlotButton";

interface TimeSlot {
  time: string;
  available: boolean;
}

interface TimeSlotsGridProps {
  title: string;
  timeSlots: TimeSlot[];
  selectedTime: string | undefined;
  onTimeSelect: (time: string) => void;
}

export function TimeSlotsGrid({ 
  title,
  timeSlots, 
  selectedTime, 
  onTimeSelect 
}: TimeSlotsGridProps) {
  if (timeSlots.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        No available time slots
      </div>
    );
  }

  return (
    <div>
      <h5 className="text-sm font-medium mb-2">{title}</h5>
      <ScrollArea className="h-[300px] rounded-md border border-kahra-darker">
        <div className="flex flex-col gap-2 p-4">
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
    </div>
  );
}