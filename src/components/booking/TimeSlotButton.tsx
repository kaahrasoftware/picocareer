
import { Button } from "@/components/ui/button";
import { formatInTimeZone } from 'date-fns-tz';
import { useUserSettings } from "@/hooks/useUserSettings";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuthSession } from "@/hooks/useAuthSession";
import { InfoCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TimeSlotButtonProps {
  time: string;
  available: boolean;
  isSelected: boolean;
  onSelect: (time: string) => void;
  mentorTimezone: string;
  date: Date;
  timezoneOffset?: number;
  originalDateTime?: Date;
}

export function TimeSlotButton({ 
  time, 
  available, 
  isSelected, 
  onSelect,
  mentorTimezone,
  date,
  timezoneOffset = 0,
  originalDateTime
}: TimeSlotButtonProps) {
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);
  const { getSetting } = useUserSettings(profile?.id || '');
  const userTimezone = getSetting('timezone') || Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Create a date object for the slot using the provided originalDateTime or by parsing the time
  let slotDate: Date;
  if (originalDateTime) {
    slotDate = new Date(originalDateTime);
  } else {
    // Fallback to manually constructing the date from parts
    const [hours, minutes] = time.split(':').map(Number);
    slotDate = new Date(date);
    slotDate.setHours(hours, minutes, 0, 0);
  }

  // Calculate current timezone offset for both mentor and user timezones
  const mentorCurrentOffset = getTimezoneOffset(mentorTimezone);
  const userCurrentOffset = getTimezoneOffset(userTimezone);
  
  // Format times using date-fns-tz which handles DST correctly
  const mentorFormattedTime = formatInTimeZone(slotDate, mentorTimezone, 'h:mm a');
  const userFormattedTime = formatInTimeZone(slotDate, userTimezone, 'h:mm a');

  return (
    <Button
      variant={isSelected ? "default" : "outline"}
      className="w-full justify-start"
      disabled={!available}
      onClick={() => onSelect(time)}
    >
      <div className="flex flex-col items-start w-full">
        <div className="flex justify-between w-full">
          <span className="font-medium">
            Mentor's time: {mentorFormattedTime}
          </span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <InfoCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Timezone: {mentorTimezone} (GMT{formatOffset(mentorCurrentOffset)})</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex justify-between w-full">
          <span className="text-xs text-muted-foreground">
            Your time: {userFormattedTime}
          </span>
          <span className="text-xs text-muted-foreground">
            {userTimezone} (GMT{formatOffset(userCurrentOffset)})
          </span>
        </div>
      </div>
    </Button>
  );
}

// Helper function to get the current offset for a timezone in minutes
function getTimezoneOffset(timezone: string): number {
  const date = new Date();
  const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
  const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
  return (utcDate.getTime() - tzDate.getTime()) / 60000;
}

// Helper function to format timezone offset for display
function formatOffset(offsetMinutes: number): string {
  const sign = offsetMinutes > 0 ? '-' : '+';
  const absMinutes = Math.abs(offsetMinutes);
  const hours = Math.floor(absMinutes / 60);
  const minutes = absMinutes % 60;
  
  if (minutes === 0) {
    return `${sign}${hours}`;
  } else {
    return `${sign}${hours}:${minutes.toString().padStart(2, '0')}`;
  }
}
