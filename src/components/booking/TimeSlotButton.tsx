import { Button } from "@/components/ui/button";
import { format, parse } from "date-fns";

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
  const displayTime = format(
    parse(time, 'HH:mm', new Date()),
    'h:mm a'
  );

  return (
    <Button
      variant={isSelected ? "default" : "outline"}
      onClick={() => onSelect(time)}
      disabled={!available}
      className={`w-full ${!available ? 'opacity-50' : ''}`}
    >
      {displayTime}
    </Button>
  );
}