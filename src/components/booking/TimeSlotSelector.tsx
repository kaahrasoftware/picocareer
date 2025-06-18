
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TimeSlotButton } from "./TimeSlotButton";
import { Loader2 } from "lucide-react";
import { format, parseISO, isSameDay } from "date-fns";

interface TimeSlotSelectorProps {
  selectedDate: Date;
  mentorId: string;
  selectedTime: string;
  onTimeSelect: (time: string) => void;
  selectedSessionType?: {
    id: string;
    type: string;
    duration: number;
    price: number;
  };
}

export function TimeSlotSelector({
  selectedDate,
  mentorId,
  selectedTime,
  onTimeSelect,
  selectedSessionType
}: TimeSlotSelectorProps) {
  const { data: timeSlots = [], isLoading, error } = useQuery({
    queryKey: ['available-time-slots', mentorId, format(selectedDate, 'yyyy-MM-dd')],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentor_availability')
        .select('*')
        .eq('profile_id', mentorId)
        .eq('is_available', true)
        .is('booked_session_id', null)
        .gte('start_date_time', format(selectedDate, 'yyyy-MM-dd'))
        .lt('start_date_time', format(new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd'))
        .order('start_date_time');

      if (error) throw error;
      return data || [];
    },
    enabled: !!mentorId && !!selectedDate
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        Error loading time slots
      </div>
    );
  }

  const availableSlots = timeSlots.filter(slot => {
    const slotDate = parseISO(slot.start_date_time);
    return isSameDay(slotDate, selectedDate);
  });

  if (availableSlots.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-4">
        No available time slots for this date
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {availableSlots.map((slot) => (
        <TimeSlotButton
          key={slot.id}
          time={format(parseISO(slot.start_date_time), 'HH:mm')}
          available={slot.is_available}
          isSelected={selectedTime === slot.start_date_time}
          onSelect={() => onTimeSelect(slot.start_date_time)}
          mentorTimezone={slot.reference_timezone || 'UTC'}
          date={selectedDate}
        />
      ))}
    </div>
  );
}
