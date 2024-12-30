import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useAvailableDates } from "@/hooks/useAvailableDates";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DateSelectorProps {
  date: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  mentorId: string;
}

export function DateSelector({ date, onDateSelect, mentorId }: DateSelectorProps) {
  const availableDates = useAvailableDates(mentorId);
  
  // Fetch mentor's availability details including timezone and available times
  const { data: mentorAvailability } = useQuery({
    queryKey: ['mentorAvailability', mentorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentor_availability')
        .select('timezone, start_time, end_time, date_available, recurring, day_of_week')
        .eq('profile_id', mentorId)
        .eq('is_available', true);

      if (error) {
        console.error('Error fetching mentor availability:', error);
        return { timezone: 'UTC', availabilities: [] };
      }

      console.log('Fetched mentor availability:', data);
      return {
        timezone: data?.[0]?.timezone || 'UTC',
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
      availability.day_of_week === dayOfWeek
    );

    // Check for specific date availability
    const formattedDate = format(date, 'yyyy-MM-dd');
    const hasSpecificSlot = mentorAvailability.availabilities.some(availability => 
      availability.date_available === formattedDate
    );

    return hasRecurringSlot || hasSpecificSlot;
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
          return date < today || !isDateAvailable(date);
        }}
        modifiers={{
          available: availableDates
        }}
        modifiersStyles={{
          available: {
            border: '2px solid #22c55e',
            borderRadius: '4px'
          }
        }}
      />
      <div className="mt-4 text-sm text-gray-400">
        <p>Mentor's timezone: {mentorAvailability?.timezone || 'Loading...'}</p>
        <p className="mt-1">Days highlighted in green are available for booking</p>
        {availableDates.length === 0 && (
          <p className="mt-1 text-yellow-500">No available dates found for this mentor</p>
        )}
      </div>
    </div>
  );
}