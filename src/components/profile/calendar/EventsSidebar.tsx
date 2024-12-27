import React from "react";
import { format } from "date-fns";
import { CalendarEvent, Availability } from "@/types/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

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
  const getEventColor = (type: CalendarEvent['event_type'], status?: string, sessionType?: string) => {
    if (type === 'session') {
      if (status === 'cancelled') {
        return 'border-red-500/20 bg-red-500/10 opacity-60 cursor-not-allowed hover:bg-red-500/10 hover:border-red-500/20';
      }
      // Different colors for different session types with improved hover states
      switch(sessionType?.toLowerCase()) {
        case 'mentorship':
          return 'border-purple-500/30 bg-purple-500/20 hover:bg-purple-500/30 hover:border-purple-500/40';
        case 'career_guidance':
          return 'border-green-500/30 bg-green-500/20 hover:bg-green-500/30 hover:border-green-500/40';
        case 'technical':
          return 'border-blue-500/30 bg-blue-500/20 hover:bg-blue-500/30 hover:border-blue-500/40';
        case 'interview_prep':
          return 'border-orange-500/30 bg-orange-500/20 hover:bg-orange-500/30 hover:border-orange-500/40';
        case 'resume_review':
          return 'border-pink-500/30 bg-pink-500/20 hover:bg-pink-500/30 hover:border-pink-500/40';
        default:
          return 'border-violet-500/30 bg-violet-500/20 hover:bg-violet-500/30 hover:border-violet-500/40';
      }
    }
    return 'border-gray-500/30 bg-gray-500/20 hover:bg-gray-500/30 hover:border-gray-500/40';
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

  const getEventWidth = (title: string) => {
    // Base width calculation on title length, with min and max constraints
    const baseWidth = Math.min(Math.max(title.length * 8, 140), 300);
    return `${baseWidth}px`;
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
          <div className="relative grid grid-cols-[80px_1fr] gap-4">
            {/* Time slots */}
            <div className="space-y-[52px] pt-6">
              {timeSlots.map((time) => (
                <div key={time} className="text-sm text-muted-foreground">
                  {time}
                </div>
              ))}
            </div>

            {/* Events grid */}
            <div className="relative border-l border-border min-h-[900px]">
              {/* Hour grid lines */}
              {timeSlots.map((_, index) => (
                <div
                  key={index}
                  className="absolute w-full border-t border-border/30"
                  style={{ top: `${index * 60}px` }}
                />
              ))}

              {/* Events */}
              {events.map((event) => (
                <div
                  key={event.id}
                  className={cn(
                    "absolute left-2 p-3 rounded-lg transition-all",
                    "shadow-sm hover:shadow-md",
                    event.status !== 'cancelled' && "hover:translate-y-[-1px]",
                    getEventColor(
                      event.event_type, 
                      event.status,
                      event.session_details?.session_type?.type
                    )
                  )}
                  style={{
                    top: getEventPosition(event.start_time),
                    width: getEventWidth(event.title),
                    minHeight: '44px',
                    zIndex: 10
                  }}
                  onClick={() => event.status !== 'cancelled' && onEventClick?.(event)}
                >
                  <div className="flex flex-col gap-1">
                    <h4 className="font-medium text-sm leading-tight truncate">
                      {event.title}
                      {event.status === 'cancelled' && (
                        <span className="ml-2 text-red-500 text-xs">(Cancelled)</span>
                      )}
                    </h4>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(event.start_time), 'h:mm a')}
                    </span>
                  </div>
                </div>
              ))}

              {/* Availability slots */}
              {isMentor && availability.map((slot, index) => (
                <div
                  key={`${slot.date_available}-${slot.start_time}-${index}`}
                  className="absolute left-2 right-2 p-3 rounded-lg border border-purple-500/30 bg-purple-500/20 hover:bg-purple-500/30 hover:border-purple-500/40 transition-colors"
                  style={{
                    top: getEventPosition(slot.start_time),
                    minHeight: '44px',
                    zIndex: 5
                  }}
                >
                  <div className="flex flex-col gap-1">
                    <h4 className="font-medium text-sm leading-tight truncate">
                      Available for Booking
                    </h4>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(`2000-01-01T${slot.start_time}`), 'h:mm a')} - 
                      {format(new Date(`2000-01-01T${slot.end_time}`), 'h:mm a')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}