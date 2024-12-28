import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { format, parse, addMinutes, isWithinInterval } from "date-fns";
import { startOfDay as getStartOfDay } from "date-fns";

interface TimeSlot {
  time: string;
  available: boolean;
}

interface MentorSessionType {
  duration: number;
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
      const today = getStartOfDay(new Date());
      
      console.log("Fetching availability for:", {
        date: formattedDate,
        dayOfWeek,
        mentorId,
        isInFuture: date >= today
      });
      
      // Query both one-time and recurring availability
      const { data: availabilityData, error: availabilityError } = await supabase
        .from('mentor_availability')
        .select('start_time, end_time, timezone, recurring, day_of_week, date_available')
        .eq('profile_id', mentorId)
        .eq('is_available', true)
        .or(
          `date_available.eq.${formattedDate},` + // One-time slots for this date
          `and(recurring.eq.true,day_of_week.eq.${dayOfWeek},date_available.lte.${formattedDate})` // Recurring slots
        );

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
        .select(`
          scheduled_at,
          session_type:mentor_session_types!inner(
            duration
          )
        `)
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
      if (availabilityData) {
        availabilityData.forEach((availability) => {
          try {
            const mentorTimezone = availability.timezone;
            console.log("Processing availability:", {
              ...availability,
              isRecurring: availability.recurring,
              dayOfWeek: availability.day_of_week,
              availabilityDate: availability.date_available
            });

            // Create a base date for today to properly handle time comparisons
            const baseDate = new Date(date);
            baseDate.setHours(0, 0, 0, 0);

            // Parse start and end times in mentor's timezone
            const [startHour, startMinute] = availability.start_time.split(':').map(Number);
            const [endHour, endMinute] = availability.end_time.split(':').map(Number);

            const startTime = new Date(baseDate);
            startTime.setHours(startHour, startMinute);

            const endTime = new Date(baseDate);
            endTime.setHours(endHour, endMinute);

            console.log("Converted times:", {
              startTime: startTime.toISOString(),
              endTime: endTime.toISOString(),
              isRecurring: availability.recurring,
              dayOfWeek: availability.day_of_week,
              originalDate: availability.date_available
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
                const bookingDuration = (booking.session_type as MentorSessionType).duration || 60;
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
      }

      console.log("Generated time slots:", slots);
      setAvailableTimeSlots(slots);
    }

    if (date && mentorId) {
      fetchAvailability();
    }
  }, [date, mentorId, sessionDuration, toast, userTimezone]);

  return availableTimeSlots;
}
