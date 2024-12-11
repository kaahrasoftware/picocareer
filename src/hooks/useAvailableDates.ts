import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { addDays, isSameDay } from "date-fns";

export function useAvailableDates(mentorId: string) {
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchAvailableDates() {
      if (!mentorId) return;

      const { data: availabilityData, error } = await supabase
        .from('mentor_availability')
        .select('day_of_week, start_time, end_time')
        .eq('profile_id', mentorId)
        .eq('is_available', true);

      if (error) {
        console.error("Error fetching availability:", error);
        toast({
          title: "Error",
          description: "Failed to load available dates",
          variant: "destructive",
        });
        return;
      }

      // Generate dates for the next 90 days where the mentor is available
      const dates: Date[] = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      for (let i = 0; i < 90; i++) {
        const date = addDays(today, i);
        const dayOfWeek = date.getDay();
        
        // Check if this day of week is in the mentor's availability
        if (availabilityData?.some(a => a.day_of_week === dayOfWeek)) {
          // Check if there's not already a booking for this date
          const startOfDay = new Date(date);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(date);
          endOfDay.setHours(23, 59, 59, 999);

          const { data: existingBookings } = await supabase
            .from('mentor_sessions')
            .select('scheduled_at')
            .eq('mentor_id', mentorId)
            .gte('scheduled_at', startOfDay.toISOString())
            .lte('scheduled_at', endOfDay.toISOString())
            .neq('status', 'cancelled');

          // Only add the date if there are no existing bookings
          if (!existingBookings?.length) {
            dates.push(date);
          }
        }
      }

      console.log("Available dates:", dates);
      setAvailableDates(dates);
    }

    fetchAvailableDates();
  }, [mentorId, toast]);

  return availableDates;
}