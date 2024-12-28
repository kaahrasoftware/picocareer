import { format, parse, addMinutes } from "date-fns";
import { formatInTimeZone } from 'date-fns-tz';
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

  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  console.log("User timezone:", userTimezone);
  console.log("Selected date:", date);
  console.log("Selected date ISO:", date.toISOString());
  console.log("Day of week:", date.getDay());

  // Use the custom hook to fetch available time slots, passing the session duration
  const availableTimeSlots = useAvailableTimeSlots(
    date, 
    mentorId, 
    selectedSessionType?.duration || 60
  );
  console.log("Available time slots in selector:", availableTimeSlots);

  // Convert time slots to user's timezone
  const convertedTimeSlots = availableTimeSlots.map(slot => {
    const slotDate = new Date(date);
    const [hours, minutes] = slot.time.split(':').map(Number);
    slotDate.setHours(hours, minutes, 0, 0);

    return {
      time: formatInTimeZone(slotDate, userTimezone, 'HH:mm'),
      available: slot.available
    };
  });

  console.log("Converted time slots:", convertedTimeSlots);

  return (
    <div>
      {selectedSessionType && (
        <p className="text-sm text-muted-foreground mb-2">
          {selectedSessionType.duration}-minute slots
        </p>
      )}
      <TimeSlotsGrid
        title={title}
        timeSlots={convertedTimeSlots}
        selectedTime={selectedTime}
        onTimeSelect={onTimeSelect}
      />
      <p className="text-xs text-muted-foreground mt-2">
        Times shown in your timezone ({userTimezone})
      </p>
    </div>
  );
}