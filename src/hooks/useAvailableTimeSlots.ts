import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { format, parse, addMinutes } from "date-fns";

interface TimeSlot {
  time: string;
  available: boolean;
}

export function useAvailableTimeSlots(date: Date | undefined, mentorId: string) {
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchAvailability() {
      if (!date || !mentorId) return;

      const formattedDate = format(date, 'yyyy-MM-dd');
      console.log("Fetching availability for date:", formattedDate, "mentor:", mentorId);
      
      // Query based on the specific date
      const { data: availabilityData, error: availabilityError } = await supabase
        .from('mentor_availability')
        .select('start_time, end_time')
        .eq('profile_id', mentorId)
        .eq('date_available', formattedDate)
        .eq('is_available', true);

      if (availabilityError) {
        console.error("Error fetching availability:", availabilityError);
        toast({
          title: "Error",
          description: "Failed to load availability",
          variant: "destructive",
        });
        return;
      }

      if (!availabilityData?.length) {
        console.log("No availability found for this date");
        setAvailableTimeSlots([]);
        return;
      }

      // Get existing bookings for this date
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const { data: bookingsData, error: bookingsError } = await supabase
        .from('mentor_sessions')
        .select('scheduled_at')
        .eq('mentor_id', mentorId)
        .gte('scheduled_at', startOfDay.toISOString())
        .lte('scheduled_at', endOfDay.toISOString())
        .neq('status', 'cancelled');

      if (bookingsError) {
        console.error("Error fetching bookings:", bookingsError);
        toast({
          title: "Error",
          description: "Failed to load bookings",
          variant: "destructive",
        });
        return;
      }

      // Generate time slots based on availability
      const slots: TimeSlot[] = [];
      availabilityData.forEach((availability) => {
        // Parse the time strings (HH:mm format)
        const startTime = parse(availability.start_time, 'HH:mm', new Date());
        const endTime = parse(availability.end_time, 'HH:mm', new Date());
        
        let currentTime = startTime;
        const increment = 15; // 15-minute increments

        while (currentTime < endTime) {
          const timeString = format(currentTime, 'HH:mm');
          const isBooked = bookingsData?.some(booking => {
            const bookingHour = new Date(booking.scheduled_at).getHours();
            const bookingMinute = new Date(booking.scheduled_at).getMinutes();
            const slotHour = currentTime.getHours();
            const slotMinute = currentTime.getMinutes();
            return bookingHour === slotHour && bookingMinute === slotMinute;
          });

          slots.push({
            time: timeString,
            available: !isBooked
          });

          currentTime = addMinutes(currentTime, increment);
        }
      });

      console.log("Generated time slots:", slots);
      setAvailableTimeSlots(slots);
    }

    if (date && mentorId) {
      fetchAvailability();
    }
  }, [date, mentorId, toast]);

  return availableTimeSlots;
}