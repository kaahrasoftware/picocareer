import { cn } from "@/lib/utils";
import { CalendarEvent } from "@/types/calendar";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

interface EventSlotProps {
  event: CalendarEvent;
  cellHeight: number;
  onClick?: (event: CalendarEvent) => void;
  timezone?: string;
}

export function EventSlot({ 
  event, 
  cellHeight, 
  onClick,
  timezone = Intl.DateTimeFormat().resolvedOptions().timeZone 
}: EventSlotProps) {
  const startTime = toZonedTime(new Date(event.start_time), timezone);
  const endTime = toZonedTime(new Date(event.end_time), timezone);
  
  const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
  const endMinutes = endTime.getHours() * 60 + endTime.getMinutes();
  const duration = endMinutes - startMinutes;
  
  const top = (startMinutes / 30) * cellHeight;
  const height = (duration / 30) * cellHeight;

  const getEventColor = () => {
    if (event.event_type === "session") {
      return "bg-blue-500/20 hover:bg-blue-500/30 border-blue-500/30";
    }
    if (event.event_type === "webinar") {
      return "bg-purple-500/20 hover:bg-purple-500/30 border-purple-500/30";
    }
    if (event.event_type === "holiday") {
      return "bg-green-500/20 hover:bg-green-500/30 border-green-500/30";
    }
    return "bg-gray-500/20 hover:bg-gray-500/30 border-gray-500/30";
  };

  return (
    <div
      className={cn(
        "absolute left-0 right-0 p-2 border rounded-md cursor-pointer transition-colors",
        getEventColor()
      )}
      style={{
        top: `${top}px`,
        height: `${Math.max(height, cellHeight)}px`,
      }}
      onClick={() => onClick?.(event)}
    >
      <div className="flex flex-col h-full overflow-hidden">
        <p className="text-xs font-medium truncate">{event.title}</p>
        <p className="text-xs text-muted-foreground">
          {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
        </p>
        {height >= cellHeight * 2 && event.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {event.description}
          </p>
        )}
      </div>
    </div>
  );
}