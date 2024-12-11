import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

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

      console.log("Fetching availability for date:", format(date, "yyyy-MM-dd"), "mentor:", mentorId);
      
      const dayOfWeek = date.getDay();
      
      // First, get the mentor's availability schedule
      const { data: availabilityData, error: availabilityError } = await supabase
        .from('mentor_availability')
        .select('start_time, end_time')
        .eq('profile_id', mentorId)
        .eq('day_of_week', dayOfWeek)
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
        console.log("No availability found for this day");
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

      console.log("Availability data:", availabilityData);
      console.log("Bookings data:", bookingsData);

      // Generate time slots based on availability
      const slots: TimeSlot[] = [];
      availabilityData.forEach((availability) => {
        const [startHour] = availability.start_time.split(':').map(Number);
        const [endHour] = availability.end_time.split(':').map(Number);
        
        for (let hour = startHour; hour < endHour; hour++) {
          const timeString = `${hour.toString().padStart(2, '0')}:00`;
          const isBooked = bookingsData?.some(booking => {
            const bookingHour = new Date(booking.scheduled_at).getHours();
            return bookingHour === hour;
          });
          
          slots.push({
            time: timeString,
            available: !isBooked
          });
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