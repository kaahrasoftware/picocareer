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

  // Create a date object in the mentor's timezone
  const [hours, minutes] = time.split(':').map(Number);
  const slotDate = new Date(date);
  slotDate.setHours(hours, minutes, 0, 0);
  
  // Adjust for timezone offset
  if (timezoneOffset) {
    slotDate.setMinutes(slotDate.getMinutes() + timezoneOffset);
  }

  // Format times in respective timezones
  const mentorTime = formatInTimeZone(slotDate, mentorTimezone, 'h:mm a');
  const userTime = formatInTimeZone(slotDate, userTimezone, 'h:mm a');

  return (
    <Button
      variant={isSelected ? "default" : "outline"}
      className="w-full justify-start"
      disabled={!available}
      onClick={() => onSelect(time)}
    >
      <div className="flex flex-col items-start">
        <span>{mentorTime}</span>
        <span className="text-xs text-muted-foreground">
          Your time: {userTime} ({userTimezone})
        </span>
      </div>
    </Button>
  );
}