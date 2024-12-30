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
}

export function TimeSlotButton({ 
  time, 
  available, 
  isSelected, 
  onSelect,
  mentorTimezone,
  date
}: TimeSlotButtonProps) {
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);
  const { getSetting } = useUserSettings(profile?.id || '');
  const userTimezone = getSetting('timezone') || Intl.DateTimeFormat().resolvedOptions().timeZone;

  const slotDate = new Date(date);
  const [hours, minutes] = time.split(':').map(Number);
  slotDate.setHours(hours, minutes, 0, 0);

  // Format time in both mentor's and user's timezone
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
        <span>{userTime}</span>
        <span className="text-xs text-muted-foreground">
          Mentor's time: {mentorTime} ({mentorTimezone})
        </span>
      </div>
    </Button>
  );
}