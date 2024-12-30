import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useAvailableDates } from "@/hooks/useAvailableDates";
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
  
  // First fetch the mentor's profile to ensure we have valid data
  const { data: mentorSettings } = useQuery({
    queryKey: ['mentorSettings', mentorId],
    queryFn: async () => {
      // First verify the profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', mentorId)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching mentor profile:', profileError);
        return 'UTC';
      }

      if (!profile) {
        console.error('Mentor profile not found');
        return 'UTC';
      }

      // Then fetch their timezone setting
      const { data: settings, error: settingsError } = await supabase
        .from('user_settings')
        .select('setting_value')
        .eq('profile_id', profile.id)
        .eq('setting_type', 'timezone')
        .maybeSingle();

      if (settingsError) {
        console.error('Error fetching mentor timezone:', settingsError);
        return 'UTC';
      }
      
      console.log('Fetched mentor timezone:', settings?.setting_value);
      return settings?.setting_value || 'UTC';
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