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
  // Parse the time and format it in 12-hour format
  const formattedTime = format(
    parse(time, 'HH:mm', new Date()),
    'h:mm a'
  );

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
      {formattedTime}
    </Button>
  );
}