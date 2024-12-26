import { format, parse, addMinutes } from "date-fns";
import { TimeSlotsGrid } from "./TimeSlotsGrid";
import { SessionType } from "@/types/database/mentors";

interface TimeSlot {
  time: string;
  available: boolean;
}

interface TimeSlotSelectorProps {
  date: Date | undefined;
  availableTimeSlots: TimeSlot[];
  selectedTime: string | undefined;
  onTimeSelect: (time: string) => void;
  selectedSessionType: SessionType | undefined;
}

export function TimeSlotSelector({ 
  date, 
  availableTimeSlots, 
  selectedTime, 
  onTimeSelect,
  selectedSessionType
}: TimeSlotSelectorProps) {
  if (!date) return null;

  // Generate time slots based on session duration
  const generateTimeSlots = () => {
    if (!availableTimeSlots.length) return [];

    const slots: TimeSlot[] = [];
    const increment = selectedSessionType?.duration || 60; // Default to 1 hour if no session type selected

    availableTimeSlots.forEach(availability => {
      const startTime = parse(availability.time, 'HH:mm', new Date());
      const endTime = addMinutes(startTime, 60); // Each availability slot is 1 hour

      let currentTime = startTime;
      while (currentTime < endTime) {
        // Check if there's enough time remaining in the slot for the selected session duration
        const slotEndTime = addMinutes(currentTime, increment);
        if (slotEndTime <= endTime) {
          slots.push({
            time: format(currentTime, 'HH:mm'),
            available: availability.available
          });
        }
        currentTime = addMinutes(currentTime, 15); // Always increment by 15 minutes for granular selection
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
      {selectedSessionType && (
        <p className="text-sm text-muted-foreground mb-2">
          {selectedSessionType.duration}-minute slots
        </p>
      )}
      <TimeSlotsGrid
        title="Available Times"
        timeSlots={timeSlots}
        selectedTime={selectedTime}
        onTimeSelect={onTimeSelect}
      />
    </div>
  );
}