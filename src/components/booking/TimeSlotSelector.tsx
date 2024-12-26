import { format, parse, addMinutes } from "date-fns";
import { TimeSlotsGrid } from "./TimeSlotsGrid";
import { SessionType } from "@/types/database/mentors";
import { useAvailableTimeSlots } from "@/hooks/useAvailableTimeSlots";

interface TimeSlotSelectorProps {
  date: Date | undefined;
  mentorId: string;
  selectedTime: string | undefined;
  onTimeSelect: (time: string) => void;
  selectedSessionType: SessionType | undefined;
  title?: string;
}

export function TimeSlotSelector({ 
  date, 
  mentorId,
  selectedTime, 
  onTimeSelect,
  selectedSessionType,
  title = "Start Time"
}: TimeSlotSelectorProps) {
  if (!date) return null;

  // Use the custom hook to fetch available time slots
  const availableTimeSlots = useAvailableTimeSlots(date, mentorId);

  // Generate time slots based on session duration
  const generateTimeSlots = () => {
    if (!availableTimeSlots.length) return [];

    const slots = [...availableTimeSlots];
    const sessionDuration = selectedSessionType?.duration || 60;

    // Filter out slots that don't have enough time for the selected session duration
    return slots.filter((slot, index) => {
      if (!slot.available) return false;

      // Check if there's enough consecutive available slots for the session
      const slotsNeeded = Math.ceil(sessionDuration / 15);
      for (let i = 0; i < slotsNeeded; i++) {
        if (!slots[index + i]?.available) return false;
      }
      return true;
    });
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