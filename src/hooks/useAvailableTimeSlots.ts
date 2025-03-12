
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, addMinutes, isWithinInterval, areIntervalsOverlapping, subMinutes, parse } from "date-fns";
import { formatInTimeZone, zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';

interface TimeSlot {
  time: string;
  available: boolean;
  timezoneOffset?: number;
  originalDateTime?: Date; // Store the original datetime for accurate conversion
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
        console.log('Fetching available time slots:', {
          date: date.toISOString(),
          mentorId,
          sessionDuration,
          mentorTimezone,
          startOfDay: startOfDay.toISOString(),
          endOfDay: endOfDay.toISOString(),
          dayOfWeek: date.getDay()
        });

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

        console.log('Available slots fetched:', availabilityData);

        // Get existing bookings
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('mentor_sessions')
          .select('scheduled_at, session_type:mentor_session_types(duration)')
          .eq('mentor_id', mentorId)
          .gte('scheduled_at', startOfDay.toISOString())
          .lte('scheduled_at', endOfDay.toISOString())
          .neq('status', 'cancelled');

        if (bookingsError) throw bookingsError;

        console.log('Existing bookings:', bookingsData);

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
            
            // Create a date in the mentor's timezone for the specific day
            startTime = new Date(date);
            startTime.setHours(recurringStart.getHours(), recurringStart.getMinutes(), 0, 0);
            
            endTime = new Date(date);
            endTime.setHours(recurringEnd.getHours(), recurringEnd.getMinutes(), 0, 0);

            console.log('Processing recurring slot:', {
              dayOfWeek: availability.day_of_week,
              selectedDay: date.getDay(),
              recurringStartHours: recurringStart.getHours(),
              recurringStartMinutes: recurringStart.getMinutes(),
              recurringEndHours: recurringEnd.getHours(),
              recurringEndMinutes: recurringEnd.getMinutes(),
              startTime: startTime.toISOString(),
              endTime: endTime.toISOString(),
              mentorTimezone
            });
          } else {
            startTime = new Date(availability.start_date_time);
            endTime = new Date(availability.end_date_time);
            
            console.log('Processing one-time slot:', {
              startTime: startTime.toISOString(),
              endTime: endTime.toISOString(),
              timezone_offset: availability.timezone_offset
            });
          }

          let currentTime = new Date(startTime);
          // Calculate the last possible slot start time that would allow for a full session
          const lastPossibleStart = subMinutes(endTime, sessionDuration);

          while (currentTime <= lastPossibleStart) {
            const slotStart = new Date(currentTime);
            const slotEnd = addMinutes(slotStart, sessionDuration);

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

            // Only add future slots
            const now = new Date();
            if (slotStart > now && !isOverlappingBooking) {
              // Format time in mentor's timezone for consistent display
              const slotTime = format(slotStart, 'HH:mm');
              
              // Store the actual datetime for accurate booking
              slots.push({
                time: slotTime,
                available: true,
                timezoneOffset: availability.timezone_offset,
                originalDateTime: slotStart
              });
            }

            currentTime = addMinutes(currentTime, 15);
          }
        });

        console.log('Generated time slots:', slots);
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
