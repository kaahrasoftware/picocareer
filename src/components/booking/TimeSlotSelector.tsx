import { format, parse, addMinutes } from "date-fns";
import { TimeSlotsGrid } from "./TimeSlotsGrid";

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

export function TimeSlotSelector({ 
  date, 
  availableTimeSlots, 
  selectedTime, 
  onTimeSelect 
}: TimeSlotSelectorProps) {
  if (!date) return null;

  // Generate 15-minute time slots between start and end times
  const generateTimeSlots = () => {
    if (!availableTimeSlots.length) return [];

    const slots: TimeSlot[] = [];
    availableTimeSlots.forEach(availability => {
      const startTime = parse(availability.time, 'HH:mm', new Date());
      const endTime = addMinutes(startTime, 60); // Each slot is 1 hour from the start time

      let currentTime = startTime;
      while (currentTime < endTime) {
        slots.push({
          time: format(currentTime, 'HH:mm'),
          available: availability.available
        });
        currentTime = addMinutes(currentTime, 15);
      }
    });

    return slots;
  };

  const timeSlots = generateTimeSlots();

  return (
    <div>
      <h4 className="font-semibold mb-2">
        Available Times for {format(date, "MMMM d, yyyy")}
      </h4>
      <TimeSlotsGrid
        timeSlots={timeSlots}
        selectedTime={selectedTime}
        onTimeSelect={onTimeSelect}
      />
    </div>
  );
}