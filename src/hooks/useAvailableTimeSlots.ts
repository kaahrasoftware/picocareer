import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, parse, addMinutes, isWithinInterval, areIntervalsOverlapping } from "date-fns";
import { formatInTimeZone, toZonedTime, fromZonedTime } from 'date-fns-tz';

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

      const { data: availabilityData, error: availabilityError } = await supabase
        .from('mentor_availability')
        .select('*')
        .eq('profile_id', mentorId)
        .or(`and(start_date_time.gte.${startOfDay.toISOString()},start_date_time.lte.${endOfDay.toISOString()}),and(recurring.eq.true,day_of_week.eq.${date.getDay()})`)
        .order('start_date_time', { ascending: true });

      if (availabilityError) {
        console.error("Error fetching availability:", availabilityError);
        toast({
          title: "Error",
          description: "Failed to load availability",
          variant: "destructive",
        });
        return;
      }

      // Get existing bookings
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

      const slots: TimeSlot[] = [];
      const availableSlots = availabilityData?.filter(slot => slot.is_available) || [];
      const unavailableSlots = availabilityData?.filter(slot => !slot.is_available) || [];

      availableSlots.forEach((availability) => {
        if (!availability.start_date_time || !availability.end_date_time) return;

        let startTime: Date;
        let endTime: Date;

        if (availability.recurring) {
          // For recurring slots, use the time portion from start/end times
          const availabilityStart = new Date(availability.start_date_time);
          const availabilityEnd = new Date(availability.end_date_time);
          
          startTime = new Date(date);
          startTime.setHours(availabilityStart.getHours(), availabilityStart.getMinutes());
          
          endTime = new Date(date);
          endTime.setHours(availabilityEnd.getHours(), availabilityEnd.getMinutes());
        } else {
          // For non-recurring slots, convert UTC times back to original timezone using offset
          const utcStart = new Date(availability.start_date_time);
          const utcEnd = new Date(availability.end_date_time);
          
          // Apply the stored timezone offset
          const offsetMillis = (availability.timezone_offset || 0) * 60000; // Convert minutes to milliseconds
          startTime = new Date(utcStart.getTime() + offsetMillis);
          endTime = new Date(utcEnd.getTime() + offsetMillis);
        }

        let currentTime = startTime;
        while (currentTime < endTime) {
          const slotStart = new Date(currentTime);
          const slotEnd = addMinutes(slotStart, sessionDuration);

          // Check for overlapping unavailable slots
          const isOverlappingUnavailable = unavailableSlots.some(unavailable => {
            const unavailableStart = new Date(unavailable.start_date_time);
            const unavailableEnd = new Date(unavailable.end_date_time);
            
            // Apply timezone offset for unavailable slots
            if (unavailable.timezone_offset) {
              const offsetMillis = unavailable.timezone_offset * 60000;
              unavailableStart.setTime(unavailableStart.getTime() + offsetMillis);
              unavailableEnd.setTime(unavailableEnd.getTime() + offsetMillis);
            }
            
            return areIntervalsOverlapping(
              { start: slotStart, end: slotEnd },
              { start: unavailableStart, end: unavailableEnd }
            );
          });

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
          if (slotStart > now && !isOverlappingUnavailable && !isOverlappingBooking) {
            // Format time in mentor's timezone and include the offset
            const timeString = formatInTimeZone(slotStart, mentorTimezone, 'HH:mm');
            slots.push({
              time: timeString,
              available: true,
              timezoneOffset: availability.timezone_offset
            });
          }

          currentTime = addMinutes(currentTime, 15);
        }
      });

      setAvailableTimeSlots(slots);
    }

    if (date && mentorId) {
      fetchAvailability();
    }
  }, [date, mentorId, sessionDuration, toast, mentorTimezone]);

  return availableTimeSlots;
}