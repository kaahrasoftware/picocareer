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
  title?: string;
}

export function TimeSlotSelector({ 
  date, 
  availableTimeSlots, 
  selectedTime, 
  onTimeSelect,
  selectedSessionType,
  title = "Start Time"
}: TimeSlotSelectorProps) {
  if (!date) return null;

  // Generate time slots based on session duration
  const generateTimeSlots = () => {
    if (!availableTimeSlots.length) return [];

    const slots: TimeSlot[] = [];
    const increment = 15; // Changed from 60 to 15 minutes
    const sessionDuration = selectedSessionType?.duration || 60;

    availableTimeSlots.forEach(availability => {
      const startTime = parse(availability.time, 'HH:mm', new Date());
      const endTime = addMinutes(startTime, 60); // Each availability slot is 1 hour

      let currentTime = startTime;
      while (currentTime < endTime) {
        // Check if there's enough time remaining in the slot for the selected session duration
        const slotEndTime = addMinutes(currentTime, sessionDuration);
        if (slotEndTime <= endTime) {
          slots.push({
            time: format(currentTime, 'HH:mm'),
            available: availability.available
          });
        }
        currentTime = addMinutes(currentTime, increment); // Increment by 15 minutes
      }
    });

    return slots;
  };

  const timeSlots = generateTimeSlots();

  return (
    <div>
      {selectedSessionType && (
        <p className="text-sm text-muted-foreground mb-2">
          {selectedSessionType.duration}-minute slots
        </p>
      )}
      <TimeSlotsGrid
        title={title}
        timeSlots={timeSlots}
        selectedTime={selectedTime}
        onTimeSelect={onTimeSelect}
      />
    </div>
  );
}