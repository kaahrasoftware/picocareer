import React from "react";
import { format } from "date-fns";
import { CalendarEvent, Availability } from "@/types/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EventsSidebarProps {
  date: Date;
  events: CalendarEvent[];
  availability?: Availability[];
  isMentor?: boolean;
  onEventClick?: (event: CalendarEvent) => void;
  timezone?: string;
}

export function EventsSidebar({ 
  date, 
  events, 
  availability = [], 
  isMentor = false, 
  onEventClick,
  timezone = Intl.DateTimeFormat().resolvedOptions().timeZone 
}: EventsSidebarProps) {
  const getEventColor = (type: CalendarEvent['event_type'], status?: string) => {
    if (type === 'session' && status === 'cancelled') {
      return 'border-red-500/20 bg-red-500/10 hover:bg-red-500/20';
    }
    return 'border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/20';
  };

  const formatTimeString = (timeStr: string) => {
    try {
      const date = new Date(timeStr);
      return format(date, 'h:mm a');
    } catch (error) {
      console.error('Error formatting time:', timeStr, error);
      return timeStr;
    }
  };

  // Generate time slots from 7 AM to 9 PM
  const timeSlots = Array.from({ length: 15 }, (_, i) => {
    const hour = i + 7; // Start from 7 AM
    return format(new Date().setHours(hour, 0, 0, 0), 'h a');
  });

  const getEventPosition = (time: string) => {
    const eventDate = new Date(time);
    const hours = eventDate.getHours();
    const minutes = eventDate.getMinutes();
    return `${(hours - 7) * 60 + minutes}px`; // 7 is the starting hour
  };

  return (
    <div className="w-[800px] bg-background border border-border rounded-lg p-4">
      <div className="space-y-4">
        <div>
          <h3 className="font-medium text-lg">
            {format(date, 'MMMM d, yyyy')}
          </h3>
          <p className="text-sm text-muted-foreground">
            Timezone: {timezone}
          </p>
        </div>

        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="relative grid grid-cols-[100px_1fr] gap-4">
            {/* Time slots */}
            <div className="space-y-14 pt-6">
              {timeSlots.map((time) => (
                <div key={time} className="text-sm text-muted-foreground">
                  {time}
                </div>
              ))}
            </div>

            {/* Events grid */}
            <div className="relative border-l border-border">
              {/* Hour grid lines */}
              {timeSlots.map((_, index) => (
                <div
                  key={index}
                  className="absolute w-full border-t border-border"
                  style={{ top: `${index * 60}px` }}
                />
              ))}

              {/* Events */}
              {events.map((event) => (
                <div
                  key={event.id}
                  className={`absolute left-2 right-2 p-2 rounded-lg cursor-pointer ${getEventColor(event.event_type, event.status)}`}
                  style={{
                    top: getEventPosition(event.start_time),
                    minHeight: '60px'
                  }}
                  onClick={() => onEventClick?.(event)}
                >
                  <h4 className="font-medium text-sm leading-tight">{event.title}</h4>
                  {event.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {event.description}
                    </p>
                  )}
                  {event.status === 'cancelled' && (
                    <span className="text-xs text-red-500">
                      Cancelled
                    </span>
                  )}
                </div>
              ))}

              {/* Availability slots */}
              {isMentor && availability.map((slot, index) => (
                <div
                  key={`${slot.date_available}-${slot.start_time}-${index}`}
                  className="absolute left-2 right-2 p-2 rounded-lg border border-purple-500/20 bg-purple-500/10"
                  style={{
                    top: getEventPosition(slot.start_time),
                    minHeight: '60px'
                  }}
                >
                  <h4 className="font-medium text-sm leading-tight">Available for Booking</h4>
                  <p className="text-xs text-muted-foreground">
                    {formatTimeString(slot.start_time)} - {formatTimeString(slot.end_time)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}