import { format, parse } from "date-fns";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
      className={cn(
        "w-full min-w-[100px] py-2 px-3 h-auto text-sm",
        !available && "opacity-50",
        isSelected && "ring-2 ring-primary ring-offset-2",
      )}
      disabled={!available}
      onClick={() => onSelect(time)}
    >
      {formattedTime}
    </Button>
  );
}