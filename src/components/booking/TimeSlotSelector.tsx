import { format } from "date-fns";
import { TimeSlotsGrid } from "./TimeSlotsGrid";
import { SessionType } from "@/types/database/mentors";
import { useAvailableTimeSlots } from "@/hooks/useAvailableTimeSlots";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserSettings } from "@/hooks/useUserSettings";

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

  // Fetch mentor's timezone from user_settings
  const { data: mentorSettings } = useQuery({
    queryKey: ['mentor-timezone', mentorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_settings')
        .select('setting_value')
        .eq('profile_id', mentorId)
        .eq('setting_type', 'timezone')
        .maybeSingle();

      if (error) {
        console.error('Error fetching mentor timezone:', error);
        return { timezone: 'UTC' };
      }

      return {
        timezone: data?.setting_value || 'UTC'
      };
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Fetch mentor's availability for this date
  const { data: mentorAvailability } = useQuery({
    queryKey: ['mentorAvailabilityTimezone', mentorId, date],
    queryFn: async () => {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('mentor_availability')
        .select('*')
        .eq('profile_id', mentorId)
        .eq('is_available', true)
        .gte('start_date_time', startOfDay.toISOString())
        .lte('start_date_time', endOfDay.toISOString())
        .maybeSingle();

      if (error) {
        console.error('Error fetching mentor availability:', error);
        return null;
      }

      // If no specific date availability, check for recurring availability
      if (!data) {
        const dayOfWeek = date.getDay();
        const { data: recurringData, error: recurringError } = await supabase
          .from('mentor_availability')
          .select('*')
          .eq('profile_id', mentorId)
          .eq('recurring', true)
          .eq('day_of_week', dayOfWeek)
          .eq('is_available', true)
          .maybeSingle();

        if (recurringError) {
          console.error('Error fetching recurring availability:', recurringError);
          return null;
        }

        if (recurringData) {
          // For recurring slots, we need to combine the date with the time
          const startDate = new Date(date);
          const endDate = new Date(date);
          
          if (recurringData.start_date_time && recurringData.end_date_time) {
            const startDateTime = new Date(recurringData.start_date_time);
            const endDateTime = new Date(recurringData.end_date_time);
            
            startDate.setHours(startDateTime.getHours(), startDateTime.getMinutes());
            endDate.setHours(endDateTime.getHours(), endDateTime.getMinutes());
            
            return {
              ...recurringData,
              start_date_time: startDate.toISOString(),
              end_date_time: endDate.toISOString()
            };
          }
        }
      }

      return data;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const mentorTimezone = mentorSettings?.timezone || 'UTC';
  const availableTimeSlots = useAvailableTimeSlots(
    date, 
    mentorId, 
    selectedSessionType?.duration || 60,
    mentorTimezone
  );

  console.log("TimeSlotSelector - Mentor timezone:", mentorTimezone);
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
        mentorTimezone={mentorTimezone}
        date={date}
      />
      <p className="text-xs text-muted-foreground mt-2">
        Times shown in mentor's timezone ({mentorTimezone})
      </p>
    </div>
  );
}