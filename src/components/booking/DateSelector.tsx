import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { MentorAvailability } from "@/types/calendar";
import { format } from "date-fns";

interface DateSelectorProps {
  mentorId: string;
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  title?: string;
}

export function DateSelector({ 
  mentorId,
  selectedDate,
  onDateSelect,
  title = "Date"
}: DateSelectorProps) {
  const { data: availabilityData } = useQuery({
    queryKey: ['mentor-availability', mentorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentor_availability')
        .select('*')
        .eq('profile_id', mentorId)
        .eq('is_available', true);

      if (error) throw error;
      return data as MentorAvailability[];
    }
  });

  const isDateAvailable = (date: Date) => {
    if (!availabilityData) return false;

    const dayOfWeek = date.getDay();
    const dateString = format(date, "yyyy-MM-dd");

    return availabilityData.some(slot => {
      // Check recurring availability
      if (slot.recurring && slot.day_of_week === dayOfWeek) {
        return true;
      }

      // Check specific date availability
      if (!slot.recurring && slot.start_date_time) {
        const slotDate = format(new Date(slot.start_date_time), "yyyy-MM-dd");
        return slotDate === dateString;
      }

      return false;
    });
  };

  const getAvailableDates = () => {
    if (!availabilityData) return [];
    
    return availabilityData
      .filter(slot => slot.start_date_time)
      .map(slot => new Date(slot.start_date_time!));
  };

  return (
    <div className="space-y-2">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={onDateSelect}
        disabled={(date) => !isDateAvailable(date)}
        modifiers={{
          available: getAvailableDates()
        }}
      />
    </div>
  );
}