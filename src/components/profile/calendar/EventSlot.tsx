import { cn } from "@/lib/utils";
import { CalendarEvent } from "@/types/calendar";
import { format } from "date-fns";
import { toZonedTime } from 'date-fns-tz';
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EventSlotProps {
  event: CalendarEvent;
  cellHeight: number;
  onClick?: (event: CalendarEvent) => void;
  onDelete?: (event: CalendarEvent) => void;
  timezone?: string;
  position?: {
    left: number;
    width: number;
  };
}

export function EventSlot({ 
  event, 
  cellHeight, 
  onClick,
  onDelete,
  timezone = Intl.DateTimeFormat().resolvedOptions().timeZone,
  position = { left: 0, width: 100 }
}: EventSlotProps) {
  const { toast } = useToast();
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

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      if (event.event_type === 'session' && event.session_details) {
        const { error } = await supabase
          .from('mentor_sessions')
          .update({ status: 'cancelled' })
          .eq('id', event.session_details.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('calendar_events')
          .delete()
          .eq('id', event.id);

        if (error) throw error;
      }

      toast({
        title: "Event deleted",
        description: "The event has been successfully removed from your calendar.",
      });

      onDelete?.(event);
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: "Failed to delete the event. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div
      className={cn(
        "absolute p-2 border rounded-md cursor-pointer transition-colors group z-20", // Added z-20
        getEventColor()
      )}
      style={{
        top: `${top}px`,
        height: `${Math.max(height, cellHeight)}px`,
        left: `${position.left}%`,
        width: `${position.width}%`,
      }}
      onClick={() => onClick?.(event)}
    >
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex justify-between items-start">
          <p className="text-xs font-medium truncate">{event.title}</p>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
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