import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export function useAvailableDates(mentorId: string) {
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchAvailableDates() {
      if (!mentorId) return;

      const { data: availabilityData, error } = await supabase
        .from('mentor_availability')
        .select('day_of_week')
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

      // Generate dates for the next 30 days where the mentor is available
      const dates: Date[] = [];
      const today = new Date();
      
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(today.getDate() + i);
        
        // Check if this day of week is in the mentor's availability
        if (availabilityData?.some(a => a.day_of_week === date.getDay())) {
          dates.push(date);
        }
      }

      setAvailableDates(dates);
    }

    fetchAvailableDates();
  }, [mentorId, toast]);

  return availableDates;
}