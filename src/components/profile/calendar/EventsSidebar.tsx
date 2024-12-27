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
      return 'bg-red-500/10 hover:bg-red-500/20';
    }
    return 'bg-blue-500/10 hover:bg-blue-500/20';
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
    <div className="w-96 bg-zinc-900/50 p-4 rounded-lg border border-zinc-800">
      <div className="space-y-4">
        <div>
          <h3 className="font-medium text-lg text-zinc-100">
            {format(date, 'MMMM d, yyyy')}
          </h3>
          <p className="text-sm text-zinc-400">
            Timezone: {timezone}
          </p>
        </div>

        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="space-y-2">
            {events.length === 0 && (!isMentor || availability.length === 0) ? (
              <p className="text-sm text-zinc-400 py-2">
                No events scheduled for this day
              </p>
            ) : (
              <>
                {events.map((event) => (
                  <div
                    key={event.id}
                    className={`p-3 rounded-lg transition-colors cursor-pointer ${getEventColor(event.event_type, event.status)}`}
                    onClick={() => onEventClick?.(event)}
                  >
                    <div className="space-y-1.5">
                      <p className="text-sm font-medium text-zinc-400">
                        {formatTimeString(event.start_time)}
                      </p>
                      <h4 className="font-medium leading-none text-zinc-100">
                        {event.title}
                      </h4>
                      {event.description && (
                        <p className="text-sm text-zinc-400">
                          {event.description}
                        </p>
                      )}
                      {event.status === 'cancelled' && (
                        <span className="text-sm text-red-400">
                          Cancelled
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {isMentor && availability.map((slot, index) => (
                  <div
                    key={`${slot.date_available}-${slot.start_time}-${index}`}
                    className="p-3 rounded-lg bg-emerald-500/10 transition-colors"
                  >
                    <div className="space-y-1.5">
                      <p className="text-sm font-medium text-zinc-400">
                        {formatTimeString(slot.start_time)} - {formatTimeString(slot.end_time)}
                      </p>
                      <h4 className="font-medium leading-none text-zinc-100">
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