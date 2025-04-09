
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TimeSlotInputs } from "./TimeSlotInputs";
import { useUserSettings } from "@/hooks/useUserSettings";
import { format, areIntervalsOverlapping } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

interface TimeSlotFormProps {
  selectedDate: Date;
  profileId: string;
  onSuccess: () => void;
  onShowUnavailable?: () => void;
}

export function TimeSlotForm({ selectedDate, profileId, onSuccess, onShowUnavailable }: TimeSlotFormProps) {
  const [selectedStartTime, setSelectedStartTime] = useState<string>();
  const [selectedEndTime, setSelectedEndTime] = useState<string>();
  const [isRecurring, setIsRecurring] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { getSetting } = useUserSettings(profileId);
  const userTimezone = getSetting('timezone');
  const isPastDate = new Date(selectedDate) < new Date();

  const checkForOverlap = async (startDateTime: Date, endDateTime: Date) => {
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get existing availability slots for the day, including recurring slots
    const { data: existingSlots, error } = await supabase
      .from('mentor_availability')
      .select('*')
      .eq('profile_id', profileId)
      .eq('is_available', true)
      .or(`and(start_date_time.gte.${startOfDay.toISOString()},start_date_time.lte.${endOfDay.toISOString()}),and(recurring.eq.true,day_of_week.eq.${selectedDate.getDay()})`);

    if (error) {
      console.error('Error checking availability:', error);
      return true;
    }

    // Check for overlaps with existing slots
    return existingSlots?.some(slot => {
      let slotStart: Date;
      let slotEnd: Date;

      if (slot.recurring) {
        // For recurring slots, use the time portion from start/end times but the date from selectedDate
        const recurringStart = new Date(slot.start_date_time);
        const recurringEnd = new Date(slot.end_date_time);
        
        slotStart = new Date(selectedDate);
        slotStart.setHours(recurringStart.getHours(), recurringStart.getMinutes(), 0, 0);
        
        slotEnd = new Date(selectedDate);
        slotEnd.setHours(recurringEnd.getHours(), recurringEnd.getMinutes(), 0, 0);
      } else {
        slotStart = new Date(slot.start_date_time);
        slotEnd = new Date(slot.end_date_time);
      }

      return areIntervalsOverlapping(
        { start: startDateTime, end: endDateTime },
        { start: slotStart, end: slotEnd }
      );
    }) || false;
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
      const startDateTime = new Date(selectedDate);
      const [startHours, startMinutes] = selectedStartTime.split(':').map(Number);
      startDateTime.setHours(startHours, startMinutes, 0, 0);

      const endDateTime = new Date(selectedDate);
      const [endHours, endMinutes] = selectedEndTime.split(':').map(Number);
      endDateTime.setHours(endHours, endMinutes, 0, 0);

      // Check for overlapping slots
      const hasOverlap = await checkForOverlap(startDateTime, endDateTime);

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
      const timezoneOffset = new Date().getTimezoneOffset();

      const { error } = await supabase
        .from('mentor_availability')
        .insert({
          profile_id: profileId,
          start_date_time: startDateTime.toISOString(),
          end_date_time: endDateTime.toISOString(),
          is_available: true,
          recurring: isRecurring,
          day_of_week: isRecurring ? dayOfWeek : null,
          timezone_offset: timezoneOffset,
          reference_timezone: userTimezone
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
    } catch (error: any) {
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
  
  const isDisabled = !selectedStartTime || !selectedEndTime || isSubmitting || !userTimezone;

  return (
    <div className="space-y-4">
      {isRecurring && (
        <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <InfoIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-sm text-blue-700 dark:text-blue-300">
            Recurring availability will only apply to this day of the week going forward, starting from today.
            Past dates will not be affected.
          </AlertDescription>
        </Alert>
      )}
      
      <TimeSlotInputs
        timeSlots={timeSlots}
        selectedDate={selectedDate}
        selectedStartTime={selectedStartTime}
        selectedEndTime={selectedEndTime}
        isRecurring={isRecurring}
        userTimezone={userTimezone || 'Not set'}
        onStartTimeSelect={setSelectedStartTime}
        onEndTimeSelect={setSelectedEndTime}
        onRecurringChange={() => setIsRecurring(!isRecurring)}
      />

      <div className="flex gap-2 mt-4">
        <Button 
          onClick={handleSaveAvailability}
          disabled={isDisabled}
          className="flex-1"
        >
          {isSubmitting ? "Saving..." : "Save Availability"}
        </Button>
        
        {onShowUnavailable && (
          <Button 
            variant="outline"
            onClick={onShowUnavailable}
            className="flex-1"
          >
            Mark Unavailable
          </Button>
        )}
      </div>
    </div>
  );
}
