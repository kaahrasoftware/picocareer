import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useAvailableDates } from "@/hooks/useAvailableDates";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMentorTimezone } from "@/hooks/useMentorTimezone";

interface DateSelectorProps {
  date: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  mentorId: string;
}

export function DateSelector({ date, onDateSelect, mentorId }: DateSelectorProps) {
  const availableDates = useAvailableDates(mentorId);
  const { data: mentorTimezone, isLoading: isLoadingTimezone } = useMentorTimezone(mentorId);
  
  // Fetch mentor's availability details
  const { data: mentorAvailability } = useQuery({
    queryKey: ['mentorAvailability', mentorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentor_availability')
        .select('*')
        .eq('profile_id', mentorId);

      if (error) {
        console.error('Error fetching mentor availability:', error);
        return { availabilities: [] };
      }

      console.log('Fetched mentor availability:', data);
      return {
        availabilities: data || []
      };
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const isDateAvailable = (date: Date) => {
    if (!mentorAvailability?.availabilities) return false;

    // Check for recurring availability (same day of week)
    const dayOfWeek = date.getDay();
    const hasRecurringSlot = mentorAvailability.availabilities.some(availability => 
      availability.recurring === true && 
      availability.day_of_week === dayOfWeek &&
      availability.is_available === true
    );

    // Check for specific date availability
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const hasSpecificSlot = mentorAvailability.availabilities.some(availability => {
      const availabilityStart = new Date(availability.start_date_time);
      return availabilityStart >= startOfDay && 
             availabilityStart <= endOfDay && 
             availability.is_available === true;
    });

    return hasRecurringSlot || hasSpecificSlot;
  };

  const isDateUnavailable = (date: Date) => {
    if (!mentorAvailability?.availabilities) return false;

    // Check for recurring unavailability (same day of week)
    const dayOfWeek = date.getDay();
    const hasRecurringUnavailable = mentorAvailability.availabilities.some(availability => 
      availability.recurring === true && 
      availability.day_of_week === dayOfWeek &&
      availability.is_available === false
    );

    // Check for specific date unavailability
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const hasSpecificUnavailable = mentorAvailability.availabilities.some(availability => {
      const availabilityStart = new Date(availability.start_date_time);
      return availabilityStart >= startOfDay && 
             availabilityStart <= endOfDay && 
             availability.is_available === false;
    });

    return hasRecurringUnavailable || hasSpecificUnavailable;
  };

  return (
    <div>
      <h4 className="font-semibold mb-2">Select Date</h4>
      <Calendar
        mode="single"
        selected={date}
        onSelect={onDateSelect}
        className="bg-kahra-darker rounded-lg p-4"
        disabled={(date) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return date < today || (!isDateAvailable(date) && !isDateUnavailable(date));
        }}
        modifiers={{
          available: (date) => isDateAvailable(date),
          unavailable: (date) => isDateUnavailable(date)
        }}
        modifiersStyles={{
          available: {
            border: '2px solid #22c55e',
            borderRadius: '4px'
          },
          unavailable: {
            border: '2px solid #ef4444',
            borderRadius: '4px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)' // Light red background
          }
        }}
      />
      <div className="mt-4 text-sm text-gray-400">
        <p>Mentor's timezone: {isLoadingTimezone ? 'Loading...' : mentorTimezone}</p>
        <p className="mt-1">Days highlighted in green are available for booking</p>
        <p className="mt-1">Days highlighted in red are marked as unavailable</p>
        {availableDates.length === 0 && (
          <p className="mt-1 text-yellow-500">No available dates found for this mentor</p>
        )}
      </div>
    </div>
  );
}