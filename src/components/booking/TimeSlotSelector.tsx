import { format, parse, addMinutes, isWithinInterval } from "date-fns";
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
  userTimezone?: string;
}

export function TimeSlotSelector({ 
  date, 
  mentorId,
  selectedTime, 
  onTimeSelect,
  selectedSessionType,
  title = "Start Time",
  userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
}: TimeSlotSelectorProps) {
  if (!date) return null;

  console.log("TimeSlotSelector - User timezone:", userTimezone);

  const availableTimeSlots = useAvailableTimeSlots(
    date, 
    mentorId, 
    selectedSessionType?.duration || 60,
    userTimezone
  );
  console.log("TimeSlotSelector - Available time slots:", availableTimeSlots);

  const convertedTimeSlots = availableTimeSlots.map(slot => {
    const slotDate = new Date(date);
    const [hours, minutes] = slot.time.split(':').map(Number);
    slotDate.setHours(hours, minutes, 0, 0);

    // Format the time in the user's timezone using the correct parameters
    const formattedTime = formatInTimeZone(slotDate, userTimezone, 'HH:mm');
    console.log("TimeSlotSelector - Converting slot:", {
      originalTime: slot.time,
      convertedTime: formattedTime,
      timezone: userTimezone
    });

    return {
      time: formattedTime,
      available: slot.available
    };
  });

  console.log("TimeSlotSelector - Converted time slots:", convertedTimeSlots);

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