import React from "react";
import { format } from "date-fns";
import { CalendarEvent } from "@/types/calendar";
import { Availability } from "./EventList";
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

  return (
    <div className="w-80 border-l border-border bg-card/50 p-4">
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
          <div className="space-y-2">
            {events.length === 0 && (!isMentor || availability.length === 0) ? (
              <p className="text-sm text-muted-foreground py-2">
                No events scheduled for this day
              </p>
            ) : (
              <>
                {events.map((event) => (
                  <div
                    key={event.id}
                    className={`p-3 rounded-lg border transition-colors cursor-pointer ${getEventColor(event.event_type, event.status)}`}
                    onClick={() => onEventClick?.(event)}
                  >
                    <div className="space-y-1.5">
                      <p className="text-sm font-medium text-muted-foreground">
                        {formatTimeString(event.start_time)}
                      </p>
                      <h4 className="font-medium leading-none">
                        {event.title}
                      </h4>
                      {event.description && (
                        <p className="text-sm text-muted-foreground">
                          {event.description}
                        </p>
                      )}
                      {event.status === 'cancelled' && (
                        <span className="text-sm text-red-500">
                          Cancelled
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {isMentor && availability.map((slot, index) => (
                  <div
                    key={`${slot.date_available}-${slot.start_time}-${index}`}
                    className="p-3 rounded-lg border border-purple-500/20 bg-purple-500/10 hover:bg-purple-500/20 transition-colors"
                  >
                    <div className="space-y-1.5">
                      <p className="text-sm font-medium text-muted-foreground">
                        {formatTimeString(slot.start_time)} - {formatTimeString(slot.end_time)}
                      </p>
                      <h4 className="font-medium leading-none">
                        Available for Booking
                      </h4>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}