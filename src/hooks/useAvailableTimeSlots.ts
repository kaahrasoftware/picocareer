import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { format, parse, addMinutes, isWithinInterval } from "date-fns";
import { formatInTimeZone, toZonedTime, fromZonedTime } from 'date-fns-tz';

interface TimeSlot {
  time: string;
  available: boolean;
}

export function useAvailableTimeSlots(date: Date | undefined, mentorId: string, sessionDuration: number = 15) {
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const { toast } = useToast();
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  useEffect(() => {
    async function fetchAvailability() {
      if (!date || !mentorId) return;

      const formattedDate = format(date, 'yyyy-MM-dd');
      const dayOfWeek = date.getDay(); // 0-6, where 0 is Sunday
      console.log("Fetching availability for date:", formattedDate, "mentor:", mentorId, "day of week:", dayOfWeek);
      
      // Query both one-time and recurring availability
      const { data: availabilityData, error: availabilityError } = await supabase
        .from('mentor_availability')
        .select('start_time, end_time, timezone, recurring, day_of_week, date_available')
        .eq('profile_id', mentorId)
        .eq('is_available', true)
        .or(`date_available.eq.${formattedDate},and(recurring.eq.true,day_of_week.eq.${dayOfWeek})`);

      if (availabilityError) {
        console.error("Error fetching availability:", availabilityError);
        toast({
          title: "Error",
          description: "Failed to load availability",
          variant: "destructive",
        });
        return;
      }

      console.log("Raw availability data:", availabilityData);

      // Get existing bookings for this date
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

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
      availabilityData?.forEach((availability) => {
        try {
          const mentorTimezone = availability.timezone;
          console.log("Processing availability:", availability);
          console.log("Mentor timezone:", mentorTimezone);

          // Create a base date for today to properly handle time comparisons
          const baseDate = new Date(date);
          baseDate.setHours(0, 0, 0, 0);

          // Parse start and end times in mentor's timezone
          const [startHour, startMinute] = availability.start_time.split(':').map(Number);
          const [endHour, endMinute] = availability.end_time.split(':').map(Number);

          const startTime = toZonedTime(
            fromZonedTime(new Date(baseDate.setHours(startHour, startMinute)), mentorTimezone),
            userTimezone
          );

          const endTime = toZonedTime(
            fromZonedTime(new Date(baseDate.setHours(endHour, endMinute)), mentorTimezone),
            userTimezone
          );

          console.log("Converted times:", {
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            isRecurring: availability.recurring,
            dayOfWeek: availability.day_of_week
          });

          let currentTime = startTime;
          const increment = 15; // 15-minute increments

          while (currentTime < endTime) {
            const timeString = format(currentTime, 'HH:mm');
            const slotStart = new Date(date);
            slotStart.setHours(currentTime.getHours(), currentTime.getMinutes());
            
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

            slots.push({
              time: timeString,
              available: !isOverlapping
            });

            currentTime = addMinutes(currentTime, increment);
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
  }, [date, mentorId, sessionDuration, toast, userTimezone]);

  return availableTimeSlots;
}