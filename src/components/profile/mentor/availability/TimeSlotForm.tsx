import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface TimeSlotFormProps {
  selectedDate: Date | undefined;
  profileId: string;
  onSuccess: () => void;
}

export function TimeSlotForm({ selectedDate, profileId, onSuccess }: TimeSlotFormProps) {
  const [selectedStartTime, setSelectedStartTime] = useState<string>();
  const [selectedEndTime, setSelectedEndTime] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const checkForOverlap = async (formattedDate: string, startTime: string, endTime: string) => {
    const { data: existingSlots } = await supabase
      .from('mentor_availability')
      .select('start_time, end_time')
      .eq('profile_id', profileId)
      .eq('date_available', formattedDate)
      .eq('is_available', true);

    if (!existingSlots) return false;

    // Convert times to comparable format (minutes since midnight)
    const newStart = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
    const newEnd = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);

    return existingSlots.some(slot => {
      const slotStart = parseInt(slot.start_time.split(':')[0]) * 60 + parseInt(slot.start_time.split(':')[1]);
      const slotEnd = parseInt(slot.end_time.split(':')[0]) * 60 + parseInt(slot.end_time.split(':')[1]);

      // Check if the new slot overlaps with any existing slot
      return (newStart < slotEnd && newEnd > slotStart);
    });
  };

  const handleSaveAvailability = async () => {
    if (!selectedDate || !selectedStartTime || !selectedEndTime) {
      toast({
        title: "Missing information",
        description: "Please select both start and end times",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');

      // Check for overlapping slots
      const hasOverlap = await checkForOverlap(formattedDate, selectedStartTime, selectedEndTime);

      if (hasOverlap) {
        toast({
          title: "Time slot conflict",
          description: "This time slot overlaps with an existing availability slot. Please choose a different time.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Insert new availability slot
      const { error } = await supabase
        .from('mentor_availability')
        .insert({
          profile_id: profileId,
          date_available: formattedDate,
          start_time: selectedStartTime,
          end_time: selectedEndTime,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          is_available: true
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Availability has been set",
      });
      
      setSelectedStartTime(undefined);
      setSelectedEndTime(undefined);
      onSuccess();
    } catch (error) {
      console.error('Error setting availability:', error);
      toast({
        title: "Error",
        description: "Failed to set availability",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate time slots for the full day in 30-minute increments
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium mb-2">Start Time</h4>
        <select
          value={selectedStartTime}
          onChange={(e) => setSelectedStartTime(e.target.value)}
          className="w-full border border-input bg-background px-3 py-2 rounded-md"
        >
          <option value="">Select start time</option>
          {timeSlots.map((time) => (
            <option 
              key={time} 
              value={time}
              disabled={selectedEndTime ? time >= selectedEndTime : false}
            >
              {time}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h4 className="font-medium mb-2">End Time</h4>
        <select
          value={selectedEndTime}
          onChange={(e) => setSelectedEndTime(e.target.value)}
          className="w-full border border-input bg-background px-3 py-2 rounded-md"
        >
          <option value="">Select end time</option>
          {timeSlots.map((time) => (
            <option 
              key={time} 
              value={time}
              disabled={selectedStartTime ? time <= selectedStartTime : false}
            >
              {time}
            </option>
          ))}
        </select>
      </div>

      <Button 
        onClick={handleSaveAvailability}
        disabled={!selectedStartTime || !selectedEndTime || isSubmitting}
        className="w-full"
      >
        {isSubmitting ? "Saving..." : "Save Availability"}
      </Button>
    </div>
  );
}