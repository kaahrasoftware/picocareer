
import { format } from "date-fns";
import { TimeSlotsGrid } from "./TimeSlotsGrid";
import { SessionType } from "@/types/database/mentors";
import { useAvailableTimeSlots } from "@/hooks/useAvailableTimeSlots";
import { useMentorTimezone } from "@/hooks/useMentorTimezone";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

interface TimeSlotSelectorProps {
  date: Date | undefined;
  mentorId: string;
  selectedTime: string | undefined;
  onTimeSelect: (time: string) => void;
  selectedSessionType: SessionType | undefined;
  title?: string;
}

export function TimeSlotSelector({ 
  date, 
  mentorId,
  selectedTime, 
  onTimeSelect,
  selectedSessionType,
  title = "Start Time"
}: TimeSlotSelectorProps) {
  if (!date) return null;

  const { data: mentorTimezone, isLoading: isLoadingTimezone, error: timezoneError } = useMentorTimezone(mentorId);

  const { 
    timeSlots: availableTimeSlots, 
    isLoading: isLoadingTimeSlots, 
    error: timeSlotsError 
  } = useAvailableTimeSlots(
    date, 
    mentorId, 
    selectedSessionType?.duration || 60,
    mentorTimezone || 'UTC'
  );

  console.log("TimeSlotSelector - Available time slots:", availableTimeSlots);
  console.log("TimeSlotSelector - Mentor timezone:", mentorTimezone);

  // Check for DST transition around the selected date
  const isDSTTransitionDay = () => {
    if (!mentorTimezone) return false;
    
    // Check the day before and after for offset changes
    const prevDay = new Date(date);
    prevDay.setDate(prevDay.getDate() - 1);
    
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    
    try {
      // Get timezone offset for each day (in minutes)
      const dateOffset = new Date(date.setHours(12,0,0,0)).getTimezoneOffset();
      const prevOffset = new Date(prevDay.setHours(12,0,0,0)).getTimezoneOffset();
      const nextOffset = new Date(nextDay.setHours(12,0,0,0)).getTimezoneOffset();
      
      // If offset changes on either side, it's a DST transition day
      return dateOffset !== prevOffset || dateOffset !== nextOffset;
    } catch (error) {
      console.error("Error checking DST transition:", error);
      return false;
    }
  };

  const isLoading = isLoadingTimezone || isLoadingTimeSlots;
  const hasError = timezoneError || timeSlotsError;

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />;
  }

  if (hasError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Error loading time slots. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      {selectedSessionType && (
        <p className="text-sm text-muted-foreground mb-2">
          {selectedSessionType.duration}-minute slots
        </p>
      )}
      <TimeSlotsGrid
        title={title}
        timeSlots={availableTimeSlots}
        selectedTime={selectedTime}
        onTimeSelect={onTimeSelect}
        mentorTimezone={mentorTimezone || 'UTC'}
        date={date}
      />
      <p className="text-xs text-muted-foreground mt-2">
        Times shown in mentor's timezone ({isLoadingTimezone ? 'Loading...' : mentorTimezone || 'UTC'})
      </p>
      
      {isDSTTransitionDay() && (
        <Alert className="mt-2">
          <AlertDescription className="text-xs">
            Note: This date may be affected by Daylight Saving Time changes. 
            Double-check the booking time in your timezone.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
