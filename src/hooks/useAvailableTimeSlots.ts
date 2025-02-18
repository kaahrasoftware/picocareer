
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, addMinutes, isWithinInterval, areIntervalsOverlapping, subMinutes } from "date-fns";

interface TimeSlot {
  time: string;
  available: boolean;
  timezoneOffset?: number;
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

      try {
        // Fetch both one-time and recurring availability, excluding booked slots
        const { data: availabilityData, error: availabilityError } = await supabase
          .from('mentor_availability')
          .select('*')
          .eq('profile_id', mentorId)
          .eq('is_available', true)
          .is('booked_session_id', null)
          .or(`and(start_date_time.gte.${startOfDay.toISOString()},start_date_time.lte.${endOfDay.toISOString()}),and(recurring.eq.true,day_of_week.eq.${date.getDay()})`)
          .order('start_date_time', { ascending: true });

        if (availabilityError) throw availabilityError;

        // Get existing bookings
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('mentor_sessions')
          .select('scheduled_at, session_type:mentor_session_types(duration)')
          .eq('mentor_id', mentorId)
          .gte('scheduled_at', startOfDay.toISOString())
          .lte('scheduled_at', endOfDay.toISOString())
          .neq('status', 'cancelled');

        if (bookingsError) throw bookingsError;

        const slots: TimeSlot[] = [];
        const availableSlots = availabilityData || [];

        availableSlots.forEach((availability) => {
          if (!availability.start_date_time || !availability.end_date_time) return;

          let startTime: Date;
          let endTime: Date;

          if (availability.recurring) {
            // For recurring slots, use the time portion from start/end times and apply it to the selected date
            const recurringStart = new Date(availability.start_date_time);
            const recurringEnd = new Date(availability.end_date_time);
            
            startTime = new Date(date);
            startTime.setHours(recurringStart.getHours(), recurringStart.getMinutes(), 0, 0);
            
            endTime = new Date(date);
            endTime.setHours(recurringEnd.getHours(), recurringEnd.getMinutes(), 0, 0);
          } else {
            startTime = new Date(availability.start_date_time);
            endTime = new Date(availability.end_date_time);
          }

          // Adjust endTime to account for session duration
          endTime = subMinutes(endTime, sessionDuration - 15);

          let currentTime = new Date(startTime);
          while (currentTime <= endTime) {
            const slotStart = new Date(currentTime);
            const slotEnd = addMinutes(slotStart, sessionDuration);

            // Check if the entire session duration fits within the availability window
            const isWithinAvailability = isWithinInterval(slotEnd, {
              start: startTime,
              end: new Date(availability.end_date_time)
            });

            if (!isWithinAvailability) {
              break;
            }

            // Check for overlapping bookings
            const isOverlappingBooking = bookingsData?.some(booking => {
              const bookingTime = new Date(booking.scheduled_at);
              const bookingDuration = booking.session_type?.duration || 60;
              const bookingEnd = addMinutes(bookingTime, bookingDuration);
              
              return areIntervalsOverlapping(
                { start: slotStart, end: slotEnd },
                { start: bookingTime, end: bookingEnd }
              );
            });

            const now = new Date();
            if (slotStart > now && !isOverlappingBooking) {
              slots.push({
                time: format(slotStart, 'HH:mm'),
                available: true,
                timezoneOffset: availability.timezone_offset
              });
            }

            currentTime = addMinutes(currentTime, 15);
          }
        });

        setAvailableTimeSlots(slots);
      } catch (error) {
        console.error("Error fetching availability:", error);
        toast({
          title: "Error",
          description: "Failed to load availability",
          variant: "destructive",
        });
      }
    }

    if (date && mentorId) {
      fetchAvailability();
    }
  }, [date, mentorId, sessionDuration, toast, mentorTimezone]);

  return availableTimeSlots;
}
