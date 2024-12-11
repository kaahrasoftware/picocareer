import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface TimeSlot {
  time: string;
  available: boolean;
}

export function useAvailableTimeSlots(date: Date | undefined, mentorId: string) {
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchAvailability() {
      if (!date || !mentorId) return;

      const dayOfWeek = date.getDay();
      
      const { data: availabilityData, error } = await supabase
        .from('mentor_availability')
        .select('*')
        .eq('profile_id', mentorId)
        .eq('day_of_week', dayOfWeek)
        .eq('is_available', true);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load availability",
          variant: "destructive",
        });
        return;
      }

      // Check existing bookings for this date
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const { data: bookingsData } = await supabase
        .from('mentor_sessions')
        .select('scheduled_at')
        .eq('mentor_id', mentorId)
        .gte('scheduled_at', startOfDay.toISOString())
        .lte('scheduled_at', endOfDay.toISOString())
        .neq('status', 'cancelled');

      // Generate available time slots
      const slots: TimeSlot[] = [];
      availabilityData?.forEach((availability) => {
        const [startHour] = availability.start_time.split(':');
        const [endHour] = availability.end_time.split(':');
        
        for (let hour = parseInt(startHour); hour < parseInt(endHour); hour++) {
          const timeString = `${hour.toString().padStart(2, '0')}:00`;
          const isBooked = bookingsData?.some(booking => {
            const bookingHour = new Date(booking.scheduled_at).getHours();
            return bookingHour === hour;
          });
          
          slots.push({
            time: timeString,
            available: !isBooked
          });
        }
      });

      setAvailableTimeSlots(slots);
    }

    if (date && mentorId) {
      fetchAvailability();
    }
  }, [date, mentorId, toast]);

  return availableTimeSlots;
}