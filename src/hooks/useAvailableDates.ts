import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export function useAvailableDates(mentorId: string) {
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchAvailableDates() {
      if (!mentorId) return;

      console.log("Fetching availability for mentor:", mentorId);

      const { data: availabilityData, error } = await supabase
        .from('mentor_availability')
        .select('date_available, start_time, end_time')
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

      // Convert the date strings to Date objects
      const dates = availabilityData?.map(availability => {
        const date = new Date(availability.date_available);
        // Reset the time part to midnight
        date.setHours(0, 0, 0, 0);
        return date;
      }) || [];

      console.log("Available dates:", dates);
      setAvailableDates(dates);
    }

    fetchAvailableDates();
  }, [mentorId, toast]);

  return availableDates;
}