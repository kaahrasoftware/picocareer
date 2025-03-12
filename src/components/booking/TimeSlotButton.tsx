
import { Button } from "@/components/ui/button";
import { formatInTimeZone } from 'date-fns-tz';
import { useUserSettings } from "@/hooks/useUserSettings";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useMemo } from "react";
import { AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

  // Create a date object for the slot
  const slotDate = useMemo(() => {
    const [hours, minutes] = time.split(':').map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, 0, 0);
    return newDate;
  }, [time, date]);

  // Check if this time slot is affected by DST
  const dstInfo = useMemo(() => {
    try {
      // Get current DST offset
      const now = new Date();
      const currentOffset = now.getTimezoneOffset();
      
      // Get slot's DST offset
      const slotOffset = slotDate.getTimezoneOffset();
      
      // Get current time in both timezones
      const userTimeStr = formatInTimeZone(slotDate, userTimezone, 'h:mm a');
      const mentorTimeStr = formatInTimeZone(slotDate, mentorTimezone, 'h:mm a');
      
      // If timezone offsets differ, DST is in effect for one but not the other
      const isDSTAffected = currentOffset !== slotOffset;
      
      // Calculate difference between user and mentor timezones in hours
      const userDate = new Date(formatInTimeZone(slotDate, userTimezone, "yyyy-MM-dd'T'HH:mm:ss"));
      const mentorDate = new Date(formatInTimeZone(slotDate, mentorTimezone, "yyyy-MM-dd'T'HH:mm:ss"));
      const hoursDiff = Math.abs(userDate.getTime() - mentorDate.getTime()) / (1000 * 60 * 60);
      
      return {
        isDSTAffected,
        userTimeStr,
        mentorTimeStr,
        hoursDiff: hoursDiff.toFixed(1)
      };
    } catch (error) {
      console.error("Error calculating DST info:", error);
      return {
        isDSTAffected: false,
        userTimeStr: formatInTimeZone(slotDate, userTimezone, 'h:mm a'),
        mentorTimeStr: formatInTimeZone(slotDate, mentorTimezone, 'h:mm a'),
        hoursDiff: "?"
      };
    }
  }, [slotDate, userTimezone, mentorTimezone]);

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <Button
            variant={isSelected ? "default" : "outline"}
            className={`w-full justify-between group ${dstInfo.isDSTAffected ? 'border-yellow-300 hover:border-yellow-400' : ''}`}
            disabled={!available}
            onClick={() => onSelect(time)}
          >
            <div className="flex flex-col items-start">
              <span className="font-medium">
                Mentor: {dstInfo.mentorTimeStr}
              </span>
              <span className="text-xs text-muted-foreground">
                You: {dstInfo.userTimeStr}
              </span>
            </div>
            
            {dstInfo.isDSTAffected && (
              <AlertCircle className="h-4 w-4 text-yellow-500 opacity-70 group-hover:opacity-100" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-[250px]">
          {dstInfo.isDSTAffected ? (
            <div className="text-xs space-y-1">
              <p className="font-medium text-yellow-500">Daylight Saving Time Notice</p>
              <p>This time slot may be affected by DST differences between your timezone and the mentor's timezone.</p>
              <p>Time difference: ~{dstInfo.hoursDiff} hours</p>
            </div>
          ) : (
            <div className="text-xs">
              <p>Mentor's timezone: {mentorTimezone}</p>
              <p>Your timezone: {userTimezone}</p>
              <p>Time difference: ~{dstInfo.hoursDiff} hours</p>
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
