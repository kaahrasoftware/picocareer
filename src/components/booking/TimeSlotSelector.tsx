import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface TimeSlot {
  time: string;
  available: boolean;
}

interface TimeSlotSelectorProps {
  date: Date | undefined;
  availableTimeSlots: TimeSlot[];
  selectedTime: string | undefined;
  onTimeSelect: (time: string) => void;
}

export function TimeSlotSelector({ date, availableTimeSlots, selectedTime, onTimeSelect }: TimeSlotSelectorProps) {
  if (!date) return null;

  return (
    <div>
      <h4 className="font-semibold mb-2">
        Available Times for {format(date, "MMMM d, yyyy")}
      </h4>
      <div className="grid grid-cols-2 gap-2">
        {availableTimeSlots.map((slot) => (
          <Button
            key={slot.time}
            variant={selectedTime === slot.time ? "default" : "outline"}
            onClick={() => onTimeSelect(slot.time)}
            disabled={!slot.available}
            className="w-full"
          >
            {slot.time}
          </Button>
        ))}
      </div>
    </div>
  );
}