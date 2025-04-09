
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TimeSlotInputs } from "./TimeSlotInputs";
import { useUserSettings } from "@/hooks/useUserSettings";
import { format, areIntervalsOverlapping, addDays } from "date-fns";
import { getTimezoneOffset } from "@/utils/timezoneUpdater";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

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
  
  // Get current user session and profile to check if admin
  const { session } = useAuthSession();
  const { data: currentUserProfile } = useUserProfile(session);
  const isAdmin = currentUserProfile?.user_type === 'admin';
  const isCurrentUser = profileId === session?.user.id;

  // Today's date for reference
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isPastDate = selectedDate < today;

  const checkExistingAvailability = async (startDateTime: Date, endDateTime: Date) => {
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
      .or(`and(start_date_time.gte.${startOfDay.toISOString()},start_date_time.lte.${endOfDay.toISOString()}),and(recurring.eq.true,day_of_week.eq.${selectedDate.getDay()})`)
      .order('start_date_time', { ascending: true });

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

      // Check for existing overlapping availability
      const hasConflict = await checkExistingAvailability(startDateTime, endDateTime);
      if (hasConflict) {
        toast({
          title: "Availability Conflict",
          description: "There is already existing availability during this time period. Please choose a different time.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const dayOfWeek = selectedDate.getDay();
      
      // Calculate timezone offset for this specific date and time
      const timezoneOffsetMinutes = getTimezoneOffset(startDateTime, userTimezone);

      console.log('Creating availability with:', {
        timezoneOffsetMinutes,
        userTimezone,
        isAdmin,
        isCurrentUser,
        profileId,
        isRecurring
      });

      // If the current user is an admin and is managing someone else's availability,
      // use the admin edge function instead of direct insert
      if (isAdmin && !isCurrentUser) {
        const { data, error } = await supabase.functions.invoke('admin-create-availability', {
          body: JSON.stringify({
            profileId,
            startDateTime: startDateTime.toISOString(),
            endDateTime: endDateTime.toISOString(),
            isAvailable: true,
            recurring: isRecurring,
            dayOfWeek: isRecurring ? dayOfWeek : null,
            timezoneOffset: timezoneOffsetMinutes,
            referenceTimezone: userTimezone,
            dstAware: true,
            lastDstCheck: new Date().toISOString()
          })
        });

        if (error) throw error;
      } else {
        // Regular insert for the user's own availability
        const { error } = await supabase
          .from('mentor_availability')
          .insert({
            profile_id: profileId,
            start_date_time: startDateTime.toISOString(),
            end_date_time: endDateTime.toISOString(),
            is_available: true,
            recurring: isRecurring,
            day_of_week: isRecurring ? dayOfWeek : null,
            timezone_offset: timezoneOffsetMinutes,
            reference_timezone: userTimezone,
            dst_aware: true,
            last_dst_check: new Date().toISOString()
          });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: isRecurring 
          ? `Weekly availability has been set for every ${format(selectedDate, 'EEEE')} going forward`
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
      {isRecurring && (
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <InfoIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertTitle className="text-blue-800 dark:text-blue-300">Weekly Recurring Availability</AlertTitle>
          <AlertDescription className="text-blue-700 dark:text-blue-400">
            When you set recurring availability, it will apply to all future {format(selectedDate, 'EEEE')}s. 
            This will not affect any dates in the past.
          </AlertDescription>
        </Alert>
      )}

      <TimeSlotInputs
        timeSlots={timeSlots}
        selectedStartTime={selectedStartTime}
        selectedEndTime={selectedEndTime}
        isRecurring={isRecurring}
        userTimezone={userTimezone || 'Not set'}
        selectedDate={selectedDate}
        onStartTimeSelect={setSelectedStartTime}
        onEndTimeSelect={setSelectedEndTime}
        onRecurringChange={setIsRecurring}
      />

      {isPastDate && (
        <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
          <InfoIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="text-amber-800 dark:text-amber-300">Past Date Selected</AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-400">
            You are setting availability for a date in the past. This is only useful if you're marking 
            time as unavailable or setting up recurring availability for future weeks.
          </AlertDescription>
        </Alert>
      )}

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
