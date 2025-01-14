import { Button } from "@/components/ui/button";
import { formatInTimeZone } from 'date-fns-tz';
import { useUserSettings } from "@/hooks/useUserSettings";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuthSession } from "@/hooks/useAuthSession";

interface TimeSlotButtonProps {
  time: string;
  available: boolean;
  isSelected: boolean;
  onSelect: (time: string) => void;
  mentorTimezone: string;
  date: Date;
  timezoneOffset?: number;
}

export function TimeSlotButton({ 
  time, 
  available, 
  isSelected, 
  onSelect,
  mentorTimezone,
  date,
  timezoneOffset = 0
}: TimeSlotButtonProps) {
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);
  const { getSetting } = useUserSettings(profile?.id || '');
  const userTimezone = getSetting('timezone') || Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Create a date object for the slot in UTC
  const [hours, minutes] = time.split(':').map(Number);
  const slotDateUTC = new Date(date);
  slotDateUTC.setHours(hours, minutes, 0, 0);
  
  // Convert UTC time back to mentor's original time
  const mentorOriginalTime = new Date(slotDateUTC.getTime() - (timezoneOffset * 60000));
  
  console.log('TimeSlotButton - Conversion details:', {
    originalTime: time,
    utcTime: slotDateUTC.toISOString(),
    mentorTimezone,
    userTimezone,
    timezoneOffset,
    mentorOriginalTime: mentorOriginalTime.toISOString()
  });

  return (
    <Button
      variant={isSelected ? "default" : "outline"}
      className="w-full justify-start"
      disabled={!available}
      onClick={() => onSelect(time)}
    >
      <div className="flex flex-col items-start">
        <span className="font-medium">
          Mentor's time: {formatInTimeZone(mentorOriginalTime, mentorTimezone, 'h:mm a')}
        </span>
        <span className="text-xs text-muted-foreground">
          Your time: {formatInTimeZone(mentorOriginalTime, userTimezone, 'h:mm a')} ({userTimezone})
        </span>
      </div>
    </Button>
  );
}