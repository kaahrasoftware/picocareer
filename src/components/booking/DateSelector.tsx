import { Calendar } from "@/components/ui/calendar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMentorTimezone } from "@/hooks/useMentorTimezone";
import { Availability } from "@/types/calendar";

interface DateSelectorProps {
  mentorId: string;
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
}

export function DateSelector({ mentorId, selectedDate, onDateSelect }: DateSelectorProps) {
  const { data: mentorTimezone, isLoading: isLoadingTimezone } = useMentorTimezone(mentorId);
  
  // Fetch mentor availability data
  const { data: mentorAvailability } = useQuery<{ availabilities: Availability[] }>({
    queryKey: ['mentor-availability', mentorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentor_availability')
        .select('*')
        .eq('profile_id', mentorId);

      if (error) {
        console.error('Error fetching mentor availability:', error);
        throw error;
      }

      return { availabilities: data || [] };
    },
  });

  // Helper function to check if a specific date is available
  const isDateAvailable = (date: Date) => {
    if (!mentorAvailability?.availabilities) return false;

    const dayOfWeek = date.getDay();
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Check recurring availability
    const hasRecurringSlot = mentorAvailability.availabilities.some(availability => 
      availability.recurring === true && 
      availability.day_of_week === dayOfWeek &&
      availability.is_available === true
    );

    // Check specific date availability
    const hasSpecificSlot = mentorAvailability.availabilities.some(availability => {
      const availabilityStart = new Date(availability.start_time);
      return availabilityStart >= startOfDay && 
             availabilityStart <= endOfDay && 
             availability.is_available === true;
    });

    return hasRecurringSlot || hasSpecificSlot;
  };

  // Helper function to check if a specific date is marked as unavailable
  const isDateUnavailable = (date: Date) => {
    if (!mentorAvailability?.availabilities) return false;

    const dayOfWeek = date.getDay();
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Check recurring unavailability
    const hasRecurringUnavailable = mentorAvailability.availabilities.some(availability => 
      availability.recurring === true && 
      availability.day_of_week === dayOfWeek &&
      availability.is_available === false
    );

    // Check specific date unavailability
    const hasSpecificUnavailable = mentorAvailability.availabilities.some(availability => {
      const availabilityStart = new Date(availability.start_time);
      return availabilityStart >= startOfDay && 
             availabilityStart <= endOfDay && 
             availability.is_available === false;
    });

    return hasRecurringUnavailable || hasSpecificUnavailable;
  };

  // Calculate available dates for the empty state message
  const availableDates = mentorAvailability?.availabilities.filter(a => a.is_available) || [];

  // Calendar styles
  const calendarModifiers = {
    available: (date: Date) => isDateAvailable(date),
    unavailable: (date: Date) => isDateUnavailable(date)
  };

  const calendarModifiersStyles = {
    available: {
      border: '2px solid #22c55e',
      borderRadius: '4px'
    },
    unavailable: {
      border: '2px solid #ef4444',
      borderRadius: '4px',
      backgroundColor: 'rgba(239, 68, 68, 0.1)'
    }
  };

  return (
    <div className="space-y-4">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={onDateSelect}
        className="rounded-md border w-full max-w-[350px] mx-auto sm:max-w-none [&_.rdp-cell]:w-9 [&_.rdp-head_th]:w-9 [&_.rdp-button]:w-9 [&_.rdp-button]:h-9 [&_.rdp-head_th]:text-xs sm:[&_.rdp-head_th]:text-sm [&_.rdp-button]:text-sm"
        disabled={(date) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return date < today || (!isDateAvailable(date) && !isDateUnavailable(date));
        }}
        modifiers={calendarModifiers}
        modifiersStyles={calendarModifiersStyles}
      />

      <div className="mt-4 space-y-2 text-xs sm:text-sm text-gray-400">
        <p>Mentor's timezone: {isLoadingTimezone ? 'Loading...' : mentorTimezone}</p>
        <p>Days highlighted in green are available for booking</p>
        <p>Days highlighted in red are marked as unavailable</p>
        {availableDates.length === 0 && (
          <p className="text-yellow-500">No available dates found for this mentor</p>
        )}
      </div>
    </div>
  );
}