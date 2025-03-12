
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
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
  const { toast } = useToast();

  const {
    data: timeSlotsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['available-time-slots', date?.toISOString(), mentorId, sessionDuration, mentorTimezone],
    queryFn: async () => {
      if (!date || !mentorId) return { timeSlots: [], availabilityData: [], bookingsData: [] };

      try {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        // Fetch both one-time and recurring availability, excluding booked slots
        const { data: availabilityData, error: availabilityError } = await supabase
          .from('mentor_availability')
          .select('*')
          .eq('profile_id', mentorId)
          .eq('is_available', true)
          .is('booked_session_id', null)
          .or(`and(start_date_time.gte.${startOfDay.toISOString()},start_date_time.lte.${endOfDay.toISOString()}),and(recurring.eq.true,day_of_week.eq.${date.getDay()})`)
          .order('start_date_time', { ascending: true });

        if (availabilityError) {
          console.error('Error fetching availability:', availabilityError);
          throw availabilityError;
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
          console.error('Error fetching bookings:', bookingsError);
          throw bookingsError;
        }

        return { 
          availabilityData: availabilityData || [], 
          bookingsData: bookingsData || [],
          timeSlots: []  // This will be computed in the component
        };
      } catch (error) {
        console.error("Error fetching availability:", error);
        throw error;
      }
    },
    enabled: !!date && !!mentorId,
    staleTime: 1000 * 60, // Cache for 1 minute
    retry: 2,
  });

  // Process time slots from the data - move processing to the client side for better performance
  const timeSlots = useMemo(() => {
    if (!date || !timeSlotsData) return [];
    
    const { availabilityData, bookingsData } = timeSlotsData;
    const slots: TimeSlot[] = [];
    const bookingMap = new Map();
    
    // Create a map of booked times for faster lookup
    (bookingsData || []).forEach(booking => {
      const bookingStart = new Date(booking.scheduled_at);
      const bookingDuration = booking.session_type?.duration || 60;
      const bookingEnd = addMinutes(bookingStart, bookingDuration);
      
      // Store start and end times for overlap checking
      bookingMap.set(booking.scheduled_at, {
        start: bookingStart,
        end: bookingEnd,
        duration: bookingDuration
      });
    });

    // Process each availability slot
    availabilityData.forEach((availability) => {
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

      let currentTime = new Date(startTime);
      // Calculate the last possible slot start time that would allow for a full session
      const lastPossibleStart = subMinutes(endTime, sessionDuration);

      while (currentTime <= lastPossibleStart) {
        const slotStart = new Date(currentTime);
        const slotEnd = addMinutes(slotStart, sessionDuration);

        // Check for overlapping bookings using the map
        let isOverlappingBooking = false;
        
        for (const bookingData of bookingMap.values()) {
          if (areIntervalsOverlapping(
            { start: slotStart, end: slotEnd },
            { start: bookingData.start, end: bookingData.end }
          )) {
            isOverlappingBooking = true;
            break;
          }
        }

        const now = new Date();
        if (slotStart > now && !isOverlappingBooking) {
          slots.push({
            time: format(slotStart, 'HH:mm'),
            available: true,
            timezoneOffset: availability.timezone_offset,
          });
        }

        currentTime = addMinutes(currentTime, 15);
      }
    });

    // Sort slots by time
    return slots.sort((a, b) => {
      const [aHours, aMinutes] = a.time.split(':').map(Number);
      const [bHours, bMinutes] = b.time.split(':').map(Number);
      
      if (aHours !== bHours) {
        return aHours - bHours;
      }
      return aMinutes - bMinutes;
    });
  }, [date, timeSlotsData, sessionDuration]);

  // Return the processed data, loading state, and error
  return { 
    timeSlots, 
    isLoading, 
    error, 
    refetch,
    rawData: timeSlotsData  // For debugging
  };
}
