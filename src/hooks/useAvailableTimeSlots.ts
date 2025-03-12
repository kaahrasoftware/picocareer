
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, addMinutes, isWithinInterval, areIntervalsOverlapping, subMinutes, parse } from "date-fns";
import { formatInTimeZone, toZonedTime, fromZonedTime } from 'date-fns-tz';

interface TimeSlot {
  time: string;
  available: boolean;
  timezoneOffset?: number;
  originalDateTime?: Date; // Store the original datetime for accurate conversion
  reference_timezone?: string;
  dst_aware?: boolean;
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

      // Create date range in the mentor's timezone
      const zonedDate = toZonedTime(date, mentorTimezone);
      const startOfDay = new Date(zonedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(zonedDate);
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

        // Calculate current timezone offset for the mentor timezone
        const currentDate = new Date();
        const currentMentorDate = toZonedTime(currentDate, mentorTimezone);
        const currentOffset = (currentDate.getTime() - fromZonedTime(currentMentorDate, 'UTC').getTime()) / (60 * 1000);

        console.log('Current timezone offset calculation:', {
          mentorTimezone,
          currentOffset,
          currentDate: currentDate.toISOString(),
          currentMentorDate: currentMentorDate.toISOString(),
        });

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
            startTime = toZonedTime(date, mentorTimezone);
            startTime.setHours(recurringStart.getHours(), recurringStart.getMinutes(), 0, 0);
            
            endTime = toZonedTime(date, mentorTimezone);
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
              mentorTimezone,
              originalOffset: availability.timezone_offset,
              currentOffset,
              reference_timezone: availability.reference_timezone || mentorTimezone,
              dst_aware: availability.dst_aware
            });
          } else {
            // For one-time slots, check if it's DST-aware or needs adjustment
            if (availability.dst_aware) {
              // DST-aware slots can be used directly
              startTime = new Date(availability.start_date_time);
              endTime = new Date(availability.end_date_time);
              
              console.log('Processing DST-aware one-time slot:', {
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                reference_timezone: availability.reference_timezone,
                timezone_offset: availability.timezone_offset
              });
            } else {
              // For non-DST-aware slots, respect the stored datetime but adjust for any DST changes
              startTime = new Date(availability.start_date_time);
              endTime = new Date(availability.end_date_time);
              
              // If the stored timezone offset differs from the current one, adjust the time
              if (availability.timezone_offset !== undefined && 
                  Math.abs(availability.timezone_offset - currentOffset) > 0) {
                const offsetDifference = currentOffset - availability.timezone_offset;
                console.log('DST change detected:', {
                  storedOffset: availability.timezone_offset,
                  currentOffset,
                  offsetDifference,
                  beforeAdjustment: startTime.toISOString()
                });
                
                // Adjust the time for DST changes
                startTime = new Date(startTime.getTime() + offsetDifference * 60 * 1000);
                endTime = new Date(endTime.getTime() + offsetDifference * 60 * 1000);
                
                console.log('After DST adjustment:', {
                  startTime: startTime.toISOString(),
                  endTime: endTime.toISOString()
                });
              }
            }
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
                timezoneOffset: currentOffset, // Store the current offset, not the historical one
                originalDateTime: slotStart,
                reference_timezone: availability.reference_timezone || mentorTimezone,
                dst_aware: true // Mark as DST-aware
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
