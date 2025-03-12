
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

  // Cache key for memoization - prevents unnecessary refetching
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

        // Run availability query and bookings query in parallel to improve performance
        const [availabilityResponse, bookingsResponse] = await Promise.all([
          // Fetch availability
          supabase
            .from('mentor_availability')
            .select('*')
            .eq('profile_id', mentorId)
            .eq('is_available', true)
            .is('booked_session_id', null)
            .or(`and(start_date_time.gte.${startOfDay.toISOString()},start_date_time.lte.${endOfDay.toISOString()}),and(recurring.eq.true,day_of_week.eq.${date.getDay()})`)
            .order('start_date_time', { ascending: true }),
          
          // Fetch bookings
          supabase
            .from('mentor_sessions')
            .select('scheduled_at, session_type:mentor_session_types(duration)')
            .eq('mentor_id', mentorId)
            .gte('scheduled_at', startOfDay.toISOString())
            .lte('scheduled_at', endOfDay.toISOString())
            .neq('status', 'cancelled')
        ]);

        if (availabilityResponse.error) throw availabilityResponse.error;
        if (bookingsResponse.error) throw bookingsResponse.error;

        const availableSlots = availabilityResponse.data || [];
        const bookings = bookingsResponse.data || [];
        
        // Current timezone offset calculation - only do this once
        const currentDate = new Date();
        const currentMentorDate = toZonedTime(currentDate, mentorTimezone);
        const currentOffset = (currentDate.getTime() - fromZonedTime(currentMentorDate, 'UTC').getTime()) / (60 * 1000);

        // Create a map of existing bookings for faster lookup
        const bookedTimes = new Map<string, boolean>();
        bookings.forEach(booking => {
          const bookingTime = new Date(booking.scheduled_at);
          const bookingDuration = booking.session_type?.duration || 60;
          const bookingEndTime = addMinutes(bookingTime, bookingDuration);
          
          // Mark all time slots within this booking as unavailable
          let currentSlot = new Date(bookingTime);
          while (currentSlot < bookingEndTime) {
            bookedTimes.set(format(currentSlot, 'yyyy-MM-dd HH:mm'), true);
            currentSlot = addMinutes(currentSlot, 15); // 15-minute increments
          }
        });
        
        // Create an array to hold all generated slots
        const generatedSlots: TimeSlot[] = [];
        
        // Process each availability block more efficiently
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
          
          // Generate time slots for this availability block - pre-allocate array size
          const now = new Date();
          for (let current = new Date(startTime); current <= lastPossibleStart; current = addMinutes(current, 15)) {
            const slotStart = new Date(current);
            
            // Skip past slots
            if (slotStart <= now) continue;
            
            // Check if this slot overlaps with a booking using our map (faster lookup)
            const slotKey = format(slotStart, 'yyyy-MM-dd HH:mm');
            const isOverlappingBooking = bookedTimes.has(slotKey);

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
