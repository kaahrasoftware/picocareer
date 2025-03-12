
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TimeSlotInputs } from "./TimeSlotInputs";
import { useUserSettings } from "@/hooks/useUserSettings";
import { getTimezoneOffset } from "@/utils/timezoneUpdater";

interface UnavailableTimeFormProps {
  selectedDate: Date;
  profileId: string;
  onSuccess: () => void;
}

export function UnavailableTimeForm({ selectedDate, profileId, onSuccess }: UnavailableTimeFormProps) {
  const [selectedStartTime, setSelectedStartTime] = useState<string>();
  const [selectedEndTime, setSelectedEndTime] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { getSetting } = useUserSettings(profileId);
  const userTimezone = getSetting('timezone');

  const handleSaveUnavailability = async () => {
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

      // Calculate timezone offset in minutes for the specific start time
      const timezoneOffsetMinutes = getTimezoneOffset(startDateTime, userTimezone);

      console.log('Creating unavailability with:', {
        timezoneOffsetMinutes,
        userTimezone
      });

      const { error } = await supabase
        .from('mentor_availability')
        .insert({
          profile_id: profileId,
          start_date_time: startDateTime.toISOString(),
          end_date_time: endDateTime.toISOString(),
          is_available: false,
          timezone_offset: timezoneOffsetMinutes,
          reference_timezone: userTimezone,
          dst_aware: true,
          last_dst_check: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Unavailable time slot has been set",
      });
      
      setSelectedStartTime(undefined);
      setSelectedEndTime(undefined);
      onSuccess();
    } catch (error) {
      console.error('Error setting unavailability:', error);
      toast({
        title: "Error",
        description: "Failed to set unavailable time slot",
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
      <h3 className="text-lg font-medium">Set Unavailable Time</h3>
      <TimeSlotInputs
        timeSlots={timeSlots}
        selectedStartTime={selectedStartTime}
        selectedEndTime={selectedEndTime}
        isRecurring={false}
        userTimezone={userTimezone || 'Not set'}
        selectedDate={selectedDate}
        onStartTimeSelect={setSelectedStartTime}
        onEndTimeSelect={setSelectedEndTime}
        onRecurringChange={() => {}}
      />

      <Button 
        onClick={handleSaveUnavailability}
        disabled={!selectedStartTime || !selectedEndTime || isSubmitting || !userTimezone}
        className="w-full bg-red-600 hover:bg-red-700 text-white"
      >
        {isSubmitting ? "Saving..." : "Mark as Unavailable"}
      </Button>
    </div>
  );
}
