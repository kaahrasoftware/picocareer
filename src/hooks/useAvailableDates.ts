import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface AvailableDate extends Date {
  recurring?: boolean;
}

export function useAvailableDates(mentorId: string) {
  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchAvailableDates() {
      if (!mentorId) return;

      console.log("Fetching availability for mentor:", mentorId);

      const { data: availabilityData, error } = await supabase
        .from('mentor_availability')
        .select('*')
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
      const dates: AvailableDate[] = [];
      
      availabilityData?.forEach(availability => {
        if (availability.recurring && availability.day_of_week !== null) {
          // For recurring availability, add the next 3 months of that day
          const today = new Date();
          for (let i = 0; i < 90; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            if (date.getDay() === availability.day_of_week) {
              const recurringDate = new Date(date);
              (recurringDate as AvailableDate).recurring = true;
              dates.push(recurringDate as AvailableDate);
            }
          }
        } else {
          // For specific dates
          const date = new Date(availability.start_date_time);
          date.setHours(0, 0, 0, 0);
          (date as AvailableDate).recurring = false;
          dates.push(date as AvailableDate);
        }
      });

      console.log("Available dates:", dates);
      setAvailableDates(dates);
    }

    fetchAvailableDates();
  }, [mentorId, toast]);

  return availableDates;
}