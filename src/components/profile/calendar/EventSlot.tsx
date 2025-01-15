import { Button } from "@/components/ui/button";
import { Clock, DollarSign, FileText, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { CalendarEvent } from "@/types/calendar";

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
  const startTime = new Date(event.start_time);
  const endTime = new Date(event.end_time);
  
  const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
  const endMinutes = endTime.getHours() * 60 + endTime.getMinutes();
  const duration = endMinutes - startMinutes;
  
  const top = (startMinutes / 30) * cellHeight;
  const height = (duration / 30) * cellHeight;

  const getEventColor = () => {
    if (event.status === 'cancelled') {
      return "bg-[#ea384c] hover:bg-[#ea384c]/90 border-[#ea384c] text-white";
    }
    if (event.event_type === "session") {
      return "bg-blue-500 hover:bg-blue-600 border-blue-600 text-white";
    }
    if (event.event_type === "webinar") {
      return "bg-purple-500 hover:bg-purple-600 border-purple-600 text-white";
    }
    if (event.event_type === "holiday") {
      return "bg-green-500 hover:bg-green-600 border-green-600 text-white";
    }
    return "bg-gray-500 hover:bg-gray-600 border-gray-600 text-white";
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
        "absolute p-2 border rounded-md cursor-pointer transition-colors group z-20",
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
        <p className="text-xs text-white/90 mb-1">
          {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
        <div className="flex justify-between items-start">
          <p className="text-xs font-medium truncate">{event.title}</p>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 text-white" />
          </Button>
        </div>
        {height >= cellHeight * 2 && event.description && (
          <p className="text-xs text-white/90 mt-1 line-clamp-2">
            {event.description}
          </p>
        )}
      </div>
    </div>
  );
}