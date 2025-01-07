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
        .eq('profile_id', mentorId)
        .eq('is_available', false);

      if (error) {
        console.error('Error fetching mentor availability:', error);
        return { availabilities: [] };
      }

      console.log('Fetched mentor unavailable dates:', data);
      return {
        availabilities: data || []
      };
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const isDateUnavailable = (date: Date) => {
    if (!mentorAvailability?.availabilities) return false;

    // Check for recurring unavailability (same day of week)
    const dayOfWeek = date.getDay();
    const hasRecurringUnavailability = mentorAvailability.availabilities.some(availability => 
      availability.recurring === true && 
      availability.day_of_week === dayOfWeek
    );

    // Check for specific date unavailability
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const hasSpecificUnavailability = mentorAvailability.availabilities.some(availability => {
      const availabilityStart = new Date(availability.start_date_time);
      return availabilityStart >= startOfDay && availabilityStart <= endOfDay;
    });

    return hasRecurringUnavailability || hasSpecificUnavailability;
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
          return date < today || isDateUnavailable(date);
        }}
        modifiers={{
          available: availableDates,
          unavailable: (date) => isDateUnavailable(date)
        }}
        modifiersStyles={{
          available: {
            border: '2px solid #22c55e',
            borderRadius: '4px'
          },
          unavailable: {
            backgroundColor: '#ea384c',
            color: 'white',
            borderRadius: '4px'
          }
        }}
      />
      <div className="mt-4 text-sm text-gray-400">
        <p>Mentor's timezone: {isLoadingTimezone ? 'Loading...' : mentorTimezone}</p>
        <p className="mt-1">Days highlighted in green are available for booking</p>
        <p className="mt-1">Days highlighted in red are unavailable</p>
        {availableDates.length === 0 && (
          <p className="mt-1 text-yellow-500">No available dates found for this mentor</p>
        )}
      </div>
    </div>
  );
}