import { useEffect, useState } from "react";
import { Availability } from "@/types/calendar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AvailabilityManagerProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  availability: Availability[];
}

export function AvailabilityManager({ selectedDate, setSelectedDate, availability }: AvailabilityManagerProps) {
  const { toast } = useToast();
  const [availableSlots, setAvailableSlots] = useState<Availability[]>(availability);

  useEffect(() => {
    const fetchAvailability = async () => {
      const { data, error } = await supabase
        .from('mentor_availability')
        .select('*')
        .eq('day_of_week', selectedDate.getDay())
        .eq('is_available', true);

      if (error) {
        console.error('Error fetching availability:', error);
        toast({
          title: "Error",
          description: "Failed to fetch availability.",
          variant: "destructive",
        });
        return;
      }

      setAvailableSlots(data as Availability[]);
    };

    fetchAvailability();
  }, [selectedDate, toast]);

  return (
    <div>
      <h2 className="text-lg font-semibold">Available Slots for {selectedDate.toDateString()}</h2>
      <ul>
        {availableSlots.map(slot => (
          <li key={slot.id}>
            {slot.start_time} - {slot.end_time}
          </li>
        ))}
      </ul>
    </div>
  );
}
