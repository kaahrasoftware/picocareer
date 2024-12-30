import { format } from "date-fns";
import { formatInTimeZone } from 'date-fns-tz';
import { TimeSlotsGrid } from "./TimeSlotsGrid";
import { SessionType } from "@/types/database/mentors";
import { useAvailableTimeSlots } from "@/hooks/useAvailableTimeSlots";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

  // Fetch mentor's timezone from their availability record for this date
  const { data: mentorTimezone } = useQuery({
    queryKey: ['mentorAvailabilityTimezone', mentorId, date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentor_availability')
        .select('timezone')
        .eq('profile_id', mentorId)
        .eq('date_available', format(date, 'yyyy-MM-dd'))
        .maybeSingle();

      if (error) {
        console.error('Error fetching mentor timezone:', error);
        return 'UTC';
      }

      console.log('Fetched mentor timezone from availability:', data?.timezone);
      return data?.timezone || 'UTC';
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  console.log("TimeSlotSelector - User timezone:", userTimezone);
  console.log("TimeSlotSelector - Mentor timezone:", mentorTimezone);

  const availableTimeSlots = useAvailableTimeSlots(
    date, 
    mentorId, 
    selectedSessionType?.duration || 60
  );
  
  console.log("TimeSlotSelector - Available time slots:", availableTimeSlots);

  // Convert time slots to user's timezone while preserving the original date
  const convertedTimeSlots = availableTimeSlots.map(slot => {
    const slotDate = new Date(date);
    const [hours, minutes] = slot.time.split(':').map(Number);
    slotDate.setHours(hours, minutes, 0, 0);

    // Format the time in the user's timezone
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
        userTimezone={userTimezone}
        mentorTimezone={mentorTimezone || 'UTC'}
        date={date}
      />
      <p className="text-xs text-muted-foreground mt-2">
        Times shown in your timezone ({userTimezone})
        {userTimezone !== mentorTimezone && ` and mentor's timezone (${mentorTimezone})`}
      </p>
    </div>
  );
}