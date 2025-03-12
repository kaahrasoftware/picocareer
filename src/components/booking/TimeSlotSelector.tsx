
import { format } from "date-fns";
import { TimeSlotsGrid } from "./TimeSlotsGrid";
import { SessionType } from "@/types/database/mentors";
import { useAvailableTimeSlots } from "@/hooks/useAvailableTimeSlots";
import { useMentorTimezone } from "@/hooks/useMentorTimezone";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

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

  // Check for DST transition around the selected date
  const { data: dstTransitionInfo, isLoading: isLoadingDSTInfo } = useQuery({
    queryKey: ['dst-transition', date.toISOString(), mentorTimezone],
    queryFn: async () => {
      if (!mentorTimezone) return { isDSTTransition: false };
      
      // Check the day before and after for offset changes
      const prevDay = new Date(date);
      prevDay.setDate(prevDay.getDate() - 1);
      
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      
      try {
        // Get timezone offset for each day (in minutes)
        const dateDate = new Date(date.setHours(12,0,0,0));
        const prevDate = new Date(prevDay.setHours(12,0,0,0));
        const nextDate = new Date(nextDay.setHours(12,0,0,0));
        
        const dateOffset = dateDate.getTimezoneOffset();
        const prevOffset = prevDate.getTimezoneOffset();
        const nextOffset = nextDate.getTimezoneOffset();
        
        // If offset changes on either side, it's a DST transition day
        const isDSTTransition = dateOffset !== prevOffset || dateOffset !== nextOffset;
        
        const direction = isDSTTransition ? 
          (dateOffset < prevOffset ? "Clocks move forward 1 hour" : "Clocks move back 1 hour") : 
          null;
        
        return { 
          isDSTTransition, 
          direction,
          dateOffset,
          prevOffset,
          nextOffset 
        };
      } catch (error) {
        console.error("Error checking DST transition:", error);
        return { isDSTTransition: false };
      }
    },
    enabled: !!date && !!mentorTimezone,
  });

  const isLoading = isLoadingTimezone || isLoadingTimeSlots || isLoadingDSTInfo;
  const hasError = timezoneError || timeSlotsError;

  if (hasError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
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
        isLoading={isLoading}
      />
      <p className="text-xs text-muted-foreground mt-2">
        Times shown in mentor's timezone ({isLoadingTimezone ? 'Loading...' : mentorTimezone || 'UTC'})
      </p>
      
      {dstTransitionInfo?.isDSTTransition && (
        <Alert className="mt-2 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-900">
          <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <AlertTitle className="text-yellow-800 dark:text-yellow-300">Daylight Saving Time Change</AlertTitle>
          <AlertDescription className="text-xs text-yellow-700 dark:text-yellow-400">
            This date is affected by Daylight Saving Time changes. 
            {dstTransitionInfo.direction && ` ${dstTransitionInfo.direction}.`}
            Double-check the booking time in your timezone.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
