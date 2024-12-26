import { format, parse } from "date-fns";
import { Button } from "@/components/ui/button";

interface TimeSlotButtonProps {
  time: string;
  available: boolean;
  isSelected: boolean;
  onSelect: (time: string) => void;
}

export function TimeSlotButton({ 
  time, 
  available, 
  isSelected, 
  onSelect 
}: TimeSlotButtonProps) {
  const formattedTime = format(
    parse(time, 'HH:mm', new Date()),
    'h:mm a'
  );

  return (
    <Button
      variant={isSelected ? "default" : "outline"}
      className={!available ? 'opacity-50' : ''}
      disabled={!available}
      onClick={() => onSelect(time)}
    >
      {formattedTime}
    </Button>
  );
}