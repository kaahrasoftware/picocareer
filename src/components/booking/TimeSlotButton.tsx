import { Button } from "@/components/ui/button";
import { formatInTimeZone } from 'date-fns-tz';

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
  mentorTimezone,
  date
}: TimeSlotButtonProps) {
  const slotDate = new Date(date);
  const [hours, minutes] = time.split(':').map(Number);
  slotDate.setHours(hours, minutes, 0, 0);

  // Format time in mentor timezone only
  const mentorTime = formatInTimeZone(slotDate, mentorTimezone, 'h:mm a');

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
          ({mentorTimezone})
        </span>
      </div>
    </Button>
  );
}