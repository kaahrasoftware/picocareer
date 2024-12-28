import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { format, addMinutes } from "date-fns";
import { startOfDay as getStartOfDay } from "date-fns";
import type { SessionType } from "@/types/calendar";

interface TimeSlot {
  time: string;
  available: boolean;
}

export function useAvailableTimeSlots(
  date: Date | undefined, 
  mentorId: string, 
  sessionDuration: number = 15
) {
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const { toast } = useToast();
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  useEffect(() => {
    async function fetchAvailability() {
      if (!date || !mentorId) return;

      const formattedDate = format(date, 'yyyy-MM-dd');
      const dayOfWeek = date.getDay();
      const today = getStartOfDay(new Date());
      
      // Query both one-time and recurring availability
      const { data: availabilityData, error: availabilityError } = await supabase
        .from('mentor_availability')
        .select('start_time, end_time, timezone, recurring, day_of_week, date_available')
        .eq('profile_id', mentorId)
        .eq('is_available', true)
        .or(
          `date_available.eq.${formattedDate},` +
          `and(recurring.eq.true,day_of_week.eq.${dayOfWeek},date_available.lte.${formattedDate})`
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
            type,
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

      // Generate time slots based on availability
      const slots: TimeSlot[] = [];
      if (availabilityData) {
        availabilityData.forEach((availability) => {
          try {
            const baseDate = new Date(date);
            baseDate.setHours(0, 0, 0, 0);

            const [startHour, startMinute] = availability.start_time.split(':').map(Number);
            const [endHour, endMinute] = availability.end_time.split(':').map(Number);

            const startTime = new Date(baseDate);
            startTime.setHours(startHour, startMinute);

            const endTime = new Date(baseDate);
            endTime.setHours(endHour, endMinute);

            let currentTime = startTime;
            const increment = 15;

            while (currentTime < endTime) {
              const timeString = format(currentTime, 'HH:mm');
              const slotStart = new Date(date);
              slotStart.setHours(currentTime.getHours(), currentTime.getMinutes());
              
              const isOverlapping = bookingsData?.some(booking => {
                const bookingTime = new Date(booking.scheduled_at);
                const bookingDuration = booking.session_type[0]?.duration || 0; // Access duration from the first item in the array
                const bookingEnd = addMinutes(bookingTime, bookingDuration);
                const slotEnd = addMinutes(slotStart, sessionDuration);
                
                return (
                  (slotStart >= bookingTime && slotStart < bookingEnd) ||
                  (slotEnd > bookingTime && slotEnd <= bookingEnd) ||
                  (slotStart <= bookingTime && slotEnd >= bookingEnd)
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

      setAvailableTimeSlots(slots);
    }

    if (date && mentorId) {
      fetchAvailability();
    }
  }, [date, mentorId, sessionDuration, toast, userTimezone]);

  return availableTimeSlots;
}