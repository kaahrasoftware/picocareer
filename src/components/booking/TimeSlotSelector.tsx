
import { format } from "date-fns";
import { TimeSlotsGrid } from "./TimeSlotsGrid";
import { SessionType } from "@/types/database/mentors";
import { useAvailableTimeSlots } from "@/hooks/useAvailableTimeSlots";
import { useMentorTimezone } from "@/hooks/useMentorTimezone";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RequestAvailabilityButton } from "./RequestAvailabilityButton";

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

  // Fetch mentor's availability for this date and future dates
  const { data: futureMentorAvailability } = useQuery({
    queryKey: ['mentorAvailabilityTimezone', mentorId, date],
    queryFn: async () => {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      // Fetch both one-time and recurring availabilities
      const { data, error } = await supabase
        .from('mentor_availability')
        .select('*')
        .eq('profile_id', mentorId)
        .eq('is_available', true)
        .gte('start_date_time', startOfDay.toISOString())
        .or('recurring.eq.true');

      if (error) {
        console.error('Error fetching mentor availability:', error);
        return null;
      }

      return data;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const availableTimeSlots = useAvailableTimeSlots(
    date, 
    mentorId, 
    selectedSessionType?.duration || 60,
    mentorTimezone || 'UTC'
  );

  const hasFutureAvailability = (futureMentorAvailability?.length ?? 0) > 0;
  console.log("TimeSlotSelector - Has future availability:", hasFutureAvailability);

  // If no future availability at all, show the request button
  if (!hasFutureAvailability) {
    return (
      <RequestAvailabilityButton
        mentorId={mentorId}
        onRequestComplete={() => {}}
      />
    );
  }

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
