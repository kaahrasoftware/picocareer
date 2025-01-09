import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Availability } from "@/types/calendar";

interface AvailabilityManagerProps {
  selectedDate?: Date;
  setSelectedDate: (date: Date) => void;
  availability?: Availability[];
  profileId: string; // Add profileId to filter by specific mentor
}

export function AvailabilityManager({ 
  selectedDate = new Date(),
  setSelectedDate, 
  availability = [],
  profileId
}: AvailabilityManagerProps) {
  const { toast } = useToast();
  const [availableSlots, setAvailableSlots] = useState<Availability[]>(availability);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!selectedDate || !profileId) return;

      setIsLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('mentor_availability')
          .select('*')
          .eq('profile_id', profileId)
          .eq('day_of_week', selectedDate.getDay())
          .eq('is_available', true);

        if (error) {
          console.error('Error fetching availability:', error);
          setError(error.message);
          toast({
            title: "Error",
            description: "Failed to fetch availability. Please try again.",
            variant: "destructive",
          });
          return;
        }

        if (data) {
          setAvailableSlots(data as Availability[]);
        } else {
          setAvailableSlots([]);
        }
      } catch (error) {
        console.error('Error in availability fetch:', error);
        setError('An unexpected error occurred');
        toast({
          title: "Error",
          description: "An unexpected error occurred while fetching availability.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailability();
  }, [selectedDate, profileId, toast]);

  if (!selectedDate) {
    return <div className="text-muted-foreground">Loading availability...</div>;
  }

  if (isLoading) {
    return <div className="text-muted-foreground">Loading available slots...</div>;
  }

  if (error) {
    return (
      <div className="text-destructive">
        Error loading availability: {error}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">
        Available Slots for {selectedDate.toDateString()}
      </h2>
      {availableSlots.length === 0 ? (
        <p className="text-muted-foreground">No available slots for this day.</p>
      ) : (
        <ul className="space-y-2">
          {availableSlots.map(slot => (
            <li key={slot.id} className="p-2 border rounded-md">
              {new Date(slot.start_date_time).toLocaleTimeString()} - {new Date(slot.end_date_time).toLocaleTimeString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}