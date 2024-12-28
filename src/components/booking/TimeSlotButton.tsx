import { format, parse } from "date-fns";
import { formatInTimeZone } from 'date-fns-tz';
import { Button } from "@/components/ui/button";

interface TimeSlotButtonProps {
  time: string;
  available: boolean;
  isSelected: boolean;
  onSelect: (time: string) => void;
  userTimezone: string;
  mentorTimezone: string;
  date: Date;
}

export function TimeSlotButton({ 
  time, 
  available, 
  isSelected, 
  onSelect,
  userTimezone,
  mentorTimezone,
  date
}: TimeSlotButtonProps) {
  // Create a date object for the time slot
  const timeDate = new Date(date);
  const [hours, minutes] = time.split(':').map(Number);
  timeDate.setHours(hours, minutes, 0, 0);

  // Format times in both timezones
  const userTime = formatInTimeZone(timeDate, userTimezone, 'h:mm a');
  const mentorTime = formatInTimeZone(timeDate, mentorTimezone, 'h:mm a');

  // Only show both times if they're different
  const displayTime = userTimezone === mentorTimezone 
    ? userTime
    : `${userTime} (${mentorTime} mentor's time)`;

  return (
    <Button
      variant={isSelected ? "default" : "outline"}
      className={`
        ${!available ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/90'} 
        ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-background hover:text-primary-foreground'} 
        py-2 px-3 h-auto text-sm font-medium rounded-md transition-colors
        w-full text-center justify-center
        border border-input shadow-sm
      `}
      disabled={!available}
      onClick={() => onSelect(time)}
    >
      {displayTime}
    </Button>
  );
}