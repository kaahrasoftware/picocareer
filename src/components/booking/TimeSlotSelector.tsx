
import { format } from "date-fns";
import { TimeSlotsGrid } from "./TimeSlotsGrid";
import { SessionType } from "@/types/database/mentors";
import { useAvailableTimeSlots } from "@/hooks/useAvailableTimeSlots";
import { useMentorTimezone } from "@/hooks/useMentorTimezone";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

  const { data: mentorTimezone, isLoading: isLoadingTimezone } = useMentorTimezone(mentorId);

  const availableTimeSlots = useAvailableTimeSlots(
    date, 
    mentorId, 
    selectedSessionType?.duration || 60,
    mentorTimezone || 'UTC'
  );

  console.log("TimeSlotSelector - Available time slots:", availableTimeSlots);

  return (
    <div>
      {selectedSessionType && (
        <p className="text-sm text-muted-foreground mb-2">
          {selectedSessionType.duration}-minute slots
        </p>
      )}
      <TimeSlotsGrid
        title={title}
        timeSlots={availableTimeSlots}
        selectedTime={selectedTime}
        onTimeSelect={onTimeSelect}
        mentorTimezone={mentorTimezone || 'UTC'}
        date={date}
      />
      <p className="text-xs text-muted-foreground mt-2">
        Times shown in mentor's timezone ({isLoadingTimezone ? 'Loading...' : mentorTimezone || 'UTC'})
      </p>
    </div>
  );
}
