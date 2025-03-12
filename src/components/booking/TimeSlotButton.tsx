
import { Button } from "@/components/ui/button";
import { formatInTimeZone } from 'date-fns-tz';
import { useUserSettings } from "@/hooks/useUserSettings";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useMemo } from "react";

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

  console.log('TimeSlotButton - Conversion details:', {
    originalTime: time,
    mentorTimezone,
    userTimezone,
    slotDate: slotDate.toISOString(),
  });

  // Calculate if this time slot is affected by DST
  const isDSTAffected = useMemo(() => {
    try {
      // Get current DST offset
      const now = new Date();
      const currentOffset = now.getTimezoneOffset();
      
      // Get slot's DST offset
      const slotOffset = slotDate.getTimezoneOffset();
      
      // If they differ, DST is in effect for one but not the other
      return currentOffset !== slotOffset;
    } catch (error) {
      return false;
    }
  }, [slotDate]);

  return (
    <Button
      variant={isSelected ? "default" : "outline"}
      className={`w-full justify-start ${isDSTAffected ? 'border-yellow-300' : ''}`}
      disabled={!available}
      onClick={() => onSelect(time)}
    >
      <div className="flex flex-col items-start">
        <span className="font-medium">
          Mentor's time: {formatInTimeZone(slotDate, mentorTimezone, 'h:mm a')}
        </span>
        <span className="text-xs text-muted-foreground">
          Your time: {formatInTimeZone(slotDate, userTimezone, 'h:mm a')} ({userTimezone})
        </span>
      </div>
    </Button>
  );
}
