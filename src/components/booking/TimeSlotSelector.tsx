
import { format } from "date-fns";
import { TimeSlotsGrid } from "./TimeSlotsGrid";
import { SessionType } from "@/types/database/mentors";
import { useAvailableTimeSlots } from "@/hooks/useAvailableTimeSlots";
import { useMentorTimezone } from "@/hooks/useMentorTimezone";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuthSession } from "@/hooks/useAuthSession";
import { Skeleton } from "@/components/ui/skeleton";

interface TimeSlotSelectorProps {
  date: Date | undefined;
  mentorId: string;
  selectedTime: string | undefined;
  onTimeSelect: (time: string) => void;
  selectedSessionType: SessionType | undefined;
  title?: string;
  onMentorTimezoneChange?: (timezone: string) => void;
}

export function TimeSlotSelector({ 
  date, 
  mentorId,
  selectedTime, 
  onTimeSelect,
  selectedSessionType,
  title = "Start Time",
  onMentorTimezoneChange
}: TimeSlotSelectorProps) {
  if (!date) return null;

  const { data: mentorTimezone, isLoading: isLoadingTimezone } = useMentorTimezone(mentorId);
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);
  const { getSetting } = useUserSettings(profile?.id || '');
  const userTimezone = getSetting('timezone') || Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Notify parent component when mentor timezone is loaded
  if (mentorTimezone && onMentorTimezoneChange) {
    onMentorTimezoneChange(mentorTimezone);
  }

  const { timeSlots: availableTimeSlots, isLoading: isLoadingTimeSlots, error } = useAvailableTimeSlots(
    date, 
    mentorId, 
    selectedSessionType?.duration || 60,
    mentorTimezone || 'UTC'
  );

  // Get current timezone offsets for display - memoize this to avoid recalculations
  const getCurrentOffset = (timezone: string): string => {
    const now = new Date();
    const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    const offsetMinutes = (tzDate.getTime() - utcDate.getTime()) / 60000;
    
    const sign = offsetMinutes > 0 ? '+' : '-';
    const absMinutes = Math.abs(offsetMinutes);
    const hours = Math.floor(absMinutes / 60);
    const minutes = absMinutes % 60;
    
    if (minutes === 0) {
      return `GMT${sign}${hours}`;
    } else {
      return `GMT${sign}${hours}:${minutes.toString().padStart(2, '0')}`;
    }
  };

  const mentorOffset = mentorTimezone ? getCurrentOffset(mentorTimezone) : '';
  const userOffset = getCurrentOffset(userTimezone);

  // Show skeleton loader during loading states
  if (isLoadingTimezone || isLoadingTimeSlots) {
    return (
      <div className="space-y-4">
        {selectedSessionType && (
          <p className="text-xs sm:text-sm text-muted-foreground mb-2">
            {selectedSessionType.duration}-minute slots
          </p>
        )}
        <Skeleton className="h-[200px] sm:h-[250px] w-full rounded-md" />
        <div className="flex flex-col xs:flex-row justify-between mt-2 gap-2">
          <Skeleton className="h-4 w-[150px]" />
          <Skeleton className="h-4 w-[120px]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 text-red-500 bg-red-50 rounded-md">
        <p className="text-sm">Error loading time slots. Please try again.</p>
      </div>
    );
  }

  return (
    <div>
      {selectedSessionType && (
        <p className="text-xs sm:text-sm text-muted-foreground mb-2">
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
      <div className="flex flex-col xs:flex-row justify-between mt-2 text-[10px] xs:text-xs text-muted-foreground">
        <p>
          Mentor: {isLoadingTimezone ? 'Loading...' : mentorTimezone || 'UTC'} 
          {mentorOffset && ` (${mentorOffset})`}
        </p>
        <p>
          You: {userTimezone} {userOffset && `(${userOffset})`}
        </p>
      </div>
    </div>
  );
}
