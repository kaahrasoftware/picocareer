import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useAvailableDates } from "@/hooks/useAvailableDates";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DateSelectorProps {
  date: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  userTimezone: string;
  mentorId: string;
}

export function DateSelector({ date, onDateSelect, userTimezone, mentorId }: DateSelectorProps) {
  const availableDates = useAvailableDates(mentorId);
  
  // Fetch mentor's timezone in real-time
  const { data: mentorSettings } = useQuery({
    queryKey: ['mentorSettings', mentorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_settings')
        .select('setting_value')
        .eq('profile_id', mentorId)
        .eq('setting_type', 'timezone')
        .single();

      if (error) throw error;
      return data?.setting_value || 'UTC';
    }
  });

  const mentorTimezone = mentorSettings || 'UTC';

  const isDateAvailable = (date: Date) => {
    // Check for recurring availability (same day of week)
    const dayOfWeek = date.getDay();
    const hasRecurringSlot = availableDates.some(availableDate => 
      availableDate.getDay() === dayOfWeek && 
      availableDate.recurring === true
    );

    // Check for specific date availability
    const hasSpecificSlot = availableDates.some(availableDate => 
      availableDate.getDate() === date.getDate() &&
      availableDate.getMonth() === date.getMonth() &&
      availableDate.getFullYear() === date.getFullYear()
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
        <p>Your timezone: {userTimezone}</p>
        <p>Mentor's timezone: {mentorTimezone}</p>
        <p className="mt-1">Days highlighted in green are available for booking</p>
        {availableDates.length === 0 && (
          <p className="mt-1 text-yellow-500">No available dates found for this mentor</p>
        )}
      </div>
    </div>
  );
}