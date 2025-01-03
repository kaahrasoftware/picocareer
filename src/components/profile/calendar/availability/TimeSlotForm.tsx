import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { TimeSlotInputs } from "./TimeSlotInputs";
import { useUserSettings } from "@/hooks/useUserSettings";

interface TimeSlotFormProps {
  selectedDate: Date;
  profileId: string;
  onSuccess: () => void;
  onShowUnavailable: () => void;
}

export function TimeSlotForm({ selectedDate, profileId, onSuccess, onShowUnavailable }: TimeSlotFormProps) {
  const [selectedStartTime, setSelectedStartTime] = useState<string>();
  const [selectedEndTime, setSelectedEndTime] = useState<string>();
  const [isRecurring, setIsRecurring] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { getSetting } = useUserSettings(profileId);
  const userTimezone = getSetting('timezone');

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
      const startDateTime = new Date(selectedDate);
      const [startHours, startMinutes] = selectedStartTime.split(':').map(Number);
      startDateTime.setHours(startHours, startMinutes, 0, 0);

      const endDateTime = new Date(selectedDate);
      const [endHours, endMinutes] = selectedEndTime.split(':').map(Number);
      endDateTime.setHours(endHours, endMinutes, 0, 0);

      const dayOfWeek = selectedDate.getDay();

      const { error } = await supabase
        .from('mentor_availability')
        .insert({
          profile_id: profileId,
          start_date_time: startDateTime.toISOString(),
          end_date_time: endDateTime.toISOString(),
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

      <div className="flex gap-2">
        <Button 
          onClick={handleSaveAvailability}
          disabled={!selectedStartTime || !selectedEndTime || isSubmitting || !userTimezone}
          className="flex-1"
        >
          {isSubmitting ? "Saving..." : "Save Availability"}
        </Button>
        <Button 
          variant="outline" 
          onClick={onShowUnavailable}
          className="flex-1"
        >
          Mark as Unavailable
        </Button>
      </div>
    </div>
  );
}