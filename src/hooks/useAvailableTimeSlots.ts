
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, addMinutes, isWithinInterval, areIntervalsOverlapping, subMinutes } from "date-fns";
import { formatInTimeZone, toZonedTime, fromZonedTime } from 'date-fns-tz';

interface TimeSlot {
  time: string;
  available: boolean;
  timezoneOffset?: number;
  originalDateTime?: Date; 
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Cache key for memoization
  const cacheKey = useMemo(() => {
    if (!date || !mentorId) return null;
    return `${mentorId}-${date.toISOString().split('T')[0]}-${sessionDuration}-${mentorTimezone}`;
  }, [date, mentorId, sessionDuration, mentorTimezone]);

  useEffect(() => {
    async function fetchAvailability() {
      if (!date || !mentorId || !cacheKey) return;
      
      setIsLoading(true);
      setError(null);

      try {
        // Create date range in the mentor's timezone
        const zonedDate = toZonedTime(date, mentorTimezone);
        const startOfDay = new Date(zonedDate);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(zonedDate);
        endOfDay.setHours(23, 59, 59, 999);

        console.log('Fetching time slots for:', {
          date: date.toISOString(),
          mentorId,
          sessionDuration,
          mentorTimezone,
          dayOfWeek: date.getDay()
        });

        // First fetch the availability
        const { data: availabilityData, error: availabilityError } = await supabase
          .from('mentor_availability')
          .select('*')
          .eq('profile_id', mentorId)
          .eq('is_available', true)
          .is('booked_session_id', null)
          .or(`and(start_date_time.gte.${startOfDay.toISOString()},start_date_time.lte.${endOfDay.toISOString()}),and(recurring.eq.true,day_of_week.eq.${date.getDay()})`)
          .order('start_date_time', { ascending: true });

        if (availabilityError) throw availabilityError;

        // Then fetch bookings in a separate query for better performance
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('mentor_sessions')
          .select('scheduled_at, session_type:mentor_session_types(duration)')
          .eq('mentor_id', mentorId)
          .gte('scheduled_at', startOfDay.toISOString())
          .lte('scheduled_at', endOfDay.toISOString())
          .neq('status', 'cancelled');

        if (bookingsError) throw bookingsError;

        // Current timezone offset calculation
        const currentDate = new Date();
        const currentMentorDate = toZonedTime(currentDate, mentorTimezone);
        const currentOffset = (currentDate.getTime() - fromZonedTime(currentMentorDate, 'UTC').getTime()) / (60 * 1000);

        const availableSlots = availabilityData || [];
        const bookings = bookingsData || [];
        
        // Create an array to hold all generated slots
        const generatedSlots: TimeSlot[] = [];
        
        // Process each availability block
        for (const availability of availableSlots) {
          if (!availability.start_date_time || !availability.end_date_time) continue;

          let startTime: Date;
          let endTime: Date;

          if (availability.recurring) {
            // For recurring slots, use the time portion from start/end times and apply it to the selected date
            const recurringStart = new Date(availability.start_date_time);
            const recurringEnd = new Date(availability.end_date_time);
            
            startTime = toZonedTime(date, mentorTimezone);
            startTime.setHours(recurringStart.getHours(), recurringStart.getMinutes(), 0, 0);
            
            endTime = toZonedTime(date, mentorTimezone);
            endTime.setHours(recurringEnd.getHours(), recurringEnd.getMinutes(), 0, 0);
          } else {
            // For one-time slots, handle DST awareness
            if (availability.dst_aware) {
              startTime = new Date(availability.start_date_time);
              endTime = new Date(availability.end_date_time);
            } else {
              // For non-DST-aware slots, adjust for DST changes if needed
              startTime = new Date(availability.start_date_time);
              endTime = new Date(availability.end_date_time);
              
              if (availability.timezone_offset !== undefined && 
                  Math.abs(availability.timezone_offset - currentOffset) > 0) {
                const offsetDifference = currentOffset - availability.timezone_offset;
                startTime = new Date(startTime.getTime() + offsetDifference * 60 * 1000);
                endTime = new Date(endTime.getTime() + offsetDifference * 60 * 1000);
              }
            }
          }

          // Calculate the last possible slot start time that would allow for a full session
          const lastPossibleStart = subMinutes(endTime, sessionDuration);
          
          // Generate time slots for this availability block
          for (let current = new Date(startTime); current <= lastPossibleStart; current = addMinutes(current, 15)) {
            const slotStart = new Date(current);
            const slotEnd = addMinutes(slotStart, sessionDuration);
            
            // Skip past slots
            const now = new Date();
            if (slotStart <= now) continue;

            // Check for overlapping bookings
            const isOverlappingBooking = bookings.some(booking => {
              const bookingTime = new Date(booking.scheduled_at);
              const bookingDuration = booking.session_type?.duration || 60;
              const bookingEnd = addMinutes(bookingTime, bookingDuration);
              
              return areIntervalsOverlapping(
                { start: slotStart, end: slotEnd },
                { start: bookingTime, end: bookingEnd }
              );
            });

            // Only add non-overlapping slots
            if (!isOverlappingBooking) {
              generatedSlots.push({
                time: format(slotStart, 'HH:mm'),
                available: true,
                timezoneOffset: currentOffset,
                originalDateTime: slotStart,
                reference_timezone: availability.reference_timezone || mentorTimezone,
                dst_aware: true
              });
            }
          }
        }

        console.log(`Generated ${generatedSlots.length} available time slots`);
        setAvailableTimeSlots(generatedSlots);
      } catch (error) {
        console.error("Error fetching availability:", error);
        setError(error instanceof Error ? error : new Error('Unknown error'));
        toast({
          title: "Error",
          description: "Failed to load availability",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    if (cacheKey) {
      fetchAvailability();
    }
  }, [cacheKey, toast]);

  return {
    timeSlots: availableTimeSlots,
    isLoading,
    error
  };
}
