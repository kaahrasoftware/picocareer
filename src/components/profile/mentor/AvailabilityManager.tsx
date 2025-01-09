import { useEffect, useState } from "react";
import { Availability } from "@/types/calendar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AvailabilityManagerProps {
  selectedDate?: Date;
  setSelectedDate: (date: Date) => void;
  availability?: Availability[];
}

export function AvailabilityManager({ 
  selectedDate = new Date(),
  setSelectedDate, 
  availability = [] // Provide default empty array
}: AvailabilityManagerProps) {
  const { toast } = useToast();
  const [availableSlots, setAvailableSlots] = useState<Availability[]>(availability);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!selectedDate) return;

      setIsLoading(true);
      try {
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

        setAvailableSlots(data as Availability[] || []);
      } catch (error) {
        console.error('Error in availability fetch:', error);
        toast({
          title: "Error",
          description: "An unexpected error occurred.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailability();
  }, [selectedDate, toast]);

  if (!selectedDate) {
    return <div>Loading availability...</div>;
  }

  if (isLoading) {
    return <div>Loading available slots...</div>;
  }

  return (
    <div>
      <h2 className="text-lg font-semibold">Available Slots for {selectedDate.toDateString()}</h2>
      {availableSlots.length === 0 ? (
        <p>No available slots for this day.</p>
      ) : (
        <ul>
          {availableSlots.map(slot => (
            <li key={slot.id}>
              {slot.start_date_time} - {slot.end_date_time}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}