import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { TimeSlotInputs } from "./TimeSlotInputs";
import { useUserSettings } from "@/hooks/useUserSettings";

interface TimeSlotFormProps {
  selectedDate: Date | undefined;
  profileId: string;
  onSuccess: () => void;
}

export function TimeSlotForm({ selectedDate, profileId, onSuccess }: TimeSlotFormProps) {
  const [selectedStartTime, setSelectedStartTime] = useState<string>();
  const [selectedEndTime, setSelectedEndTime] = useState<string>();
  const [isRecurring, setIsRecurring] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { getSetting } = useUserSettings(profileId);
  const userTimezone = getSetting('timezone');

  useEffect(() => {
    if (!userTimezone) {
      toast({
        title: "Timezone not set",
        description: "Please set your timezone in settings before setting availability",
        variant: "destructive",
      });
    }
  }, [userTimezone, toast]);

  const checkForOverlap = async (formattedDate: string, startTime: string, endTime: string) => {
    const { data: existingSlots } = await supabase
      .from('mentor_availability')
      .select('start_time, end_time')
      .eq('profile_id', profileId)
      .eq('date_available', formattedDate)
      .eq('is_available', true);

    if (!existingSlots) return false;

    const newStart = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
    const newEnd = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);

    return existingSlots.some(slot => {
      const slotStart = parseInt(slot.start_time.split(':')[0]) * 60 + parseInt(slot.start_time.split(':')[1]);
      const slotEnd = parseInt(slot.end_time.split(':')[0]) * 60 + parseInt(slot.end_time.split(':')[1]);
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

    if (!userTimezone) {
      toast({
        title: "Timezone not set",
        description: "Please set your timezone in settings before setting availability",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
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

      const dayOfWeek = selectedDate.getDay();

      const { error } = await supabase
        .from('mentor_availability')
        .insert({
          profile_id: profileId,
          date_available: formattedDate,
          start_time: selectedStartTime,
          end_time: selectedEndTime,
          timezone: userTimezone,
          is_available: true,
          recurring: isRecurring,
          day_of_week: isRecurring ? dayOfWeek : null
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: isRecurring 
          ? `Weekly availability has been set for every ${format(selectedDate, 'EEEE')}`
          : "Availability has been set",
      });
      
      setSelectedStartTime(undefined);
      setSelectedEndTime(undefined);
      setIsRecurring(false);
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
      <TimeSlotInputs
        timeSlots={timeSlots}
        selectedStartTime={selectedStartTime}
        selectedEndTime={selectedEndTime}
        isRecurring={isRecurring}
        userTimezone={userTimezone || 'Not set'}
        onStartTimeSelect={setSelectedStartTime}
        onEndTimeSelect={setSelectedEndTime}
        onRecurringChange={setIsRecurring}
      />

      <Button 
        onClick={handleSaveAvailability}
        disabled={!selectedStartTime || !selectedEndTime || isSubmitting || !userTimezone}
        className="w-full"
      >
        {isSubmitting ? "Saving..." : "Save Availability"}
      </Button>
    </div>
  );
}