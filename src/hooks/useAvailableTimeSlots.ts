import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, parse, addMinutes, isWithinInterval } from "date-fns";
import { formatInTimeZone } from 'date-fns-tz';

interface TimeSlot {
  time: string;
  available: boolean;
}

export function useAvailableTimeSlots(
  date: Date | undefined, 
  mentorId: string, 
  sessionDuration: number = 15,
  mentorTimezone: string = 'UTC'
) {
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchAvailability() {
      if (!date || !mentorId) return;

      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      console.log("Fetching availability for date:", startOfDay, "mentor:", mentorId);
      
      // Query based on the specific date and ensure is_available is true
      const { data: availabilityData, error: availabilityError } = await supabase
        .from('mentor_availability')
        .select('*')
        .eq('profile_id', mentorId)
        .eq('is_available', true)
        .or(`and(start_date_time.gte.${startOfDay.toISOString()},start_date_time.lte.${endOfDay.toISOString()}),and(recurring.eq.true,day_of_week.eq.${date.getDay()})`);

      if (availabilityError) {
        console.error("Error fetching availability:", availabilityError);
        toast({
          title: "Error",
          description: "Failed to load availability",
          variant: "destructive",
        });
        return;
      }

      console.log("Availability data:", availabilityData);

      if (!availabilityData?.length) {
        console.log("No availability found for this date");
        setAvailableTimeSlots([]);
        return;
      }

      // Get existing bookings for this date
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('mentor_sessions')
        .select('scheduled_at, session_type:mentor_session_types(duration)')
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

      console.log("Bookings data:", bookingsData);

      // Generate time slots based on availability
      const slots: TimeSlot[] = [];
      availabilityData.forEach((availability) => {
        try {
          if (!availability.start_date_time || !availability.end_date_time) return;

          let startTime: Date;
          let endTime: Date;

          if (availability.recurring) {
            // For recurring slots, combine the selected date with the time from availability
            const availabilityStart = new Date(availability.start_date_time);
            const availabilityEnd = new Date(availability.end_date_time);
            
            startTime = new Date(date);
            startTime.setHours(availabilityStart.getHours(), availabilityStart.getMinutes());
            
            endTime = new Date(date);
            endTime.setHours(availabilityEnd.getHours(), availabilityEnd.getMinutes());
          } else {
            startTime = new Date(availability.start_date_time);
            endTime = new Date(availability.end_date_time);
          }

          let currentTime = startTime;

          while (currentTime < endTime) {
            const timeString = formatInTimeZone(currentTime, mentorTimezone, 'HH:mm');
            const slotStart = new Date(currentTime);
            
            // Check if this time slot overlaps with any existing booking
            const isOverlapping = bookingsData?.some(booking => {
              const bookingTime = new Date(booking.scheduled_at);
              const bookingDuration = booking.session_type?.duration || 60;
              const bookingEnd = addMinutes(bookingTime, bookingDuration);
              
              // Check if the current slot (considering session duration) overlaps with the booking
              const slotEnd = addMinutes(slotStart, sessionDuration);
              
              return (
                (slotStart >= bookingTime && slotStart < bookingEnd) || // Slot start falls within booking
                (slotEnd > bookingTime && slotEnd <= bookingEnd) || // Slot end falls within booking
                (slotStart <= bookingTime && slotEnd >= bookingEnd) // Slot encompasses booking
              );
            });

            // Only add the slot if it's in the future
            const now = new Date();
            if (slotStart > now) {
              slots.push({
                time: timeString,
                available: !isOverlapping
              });
            }

            currentTime = addMinutes(currentTime, 15); // 15-minute increments
          }
        } catch (error) {
          console.error("Error processing availability slot:", error);
        }
      });

      console.log("Generated time slots:", slots);
      setAvailableTimeSlots(slots);
    }

    if (date && mentorId) {
      fetchAvailability();
    }
  }, [date, mentorId, sessionDuration, toast, mentorTimezone]);

  return availableTimeSlots;
}