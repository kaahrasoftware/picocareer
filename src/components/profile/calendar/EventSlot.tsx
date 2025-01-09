import { format } from "date-fns";
import { CalendarEvent } from "@/types/calendar";

interface EventSlotProps {
  event: CalendarEvent;
  onClick?: () => void;
}

export function EventSlot({ event, onClick }: EventSlotProps) {
  return (
    <div 
      className="bg-primary/10 text-primary rounded p-2 cursor-pointer hover:bg-primary/20 transition-colors"
      onClick={onClick}
    >
      <h4 className="font-medium text-sm">{event.title}</h4>
      <p className="text-xs text-muted-foreground">
        {format(new Date(event.start_date_time), "h:mm a")} - {format(new Date(event.end_date_time), "h:mm a")}
      </p>
    </div>
  );
}