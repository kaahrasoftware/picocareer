import React from "react";
import { format } from "date-fns";
import { CalendarEvent, Availability } from "@/types/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatInTimeZone } from 'date-fns-tz';
import { TimeGrid } from "./TimeGrid";

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
        return 'border-red-500/20 bg-red-500/5 opacity-75 cursor-not-allowed hover:bg-red-500/5';
      }
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

  const getEventPosition = (timeStr: string) => {
    try {
      // Parse the time string into hours and minutes
      const [hours, minutes] = timeStr.split(':').map(Number);
      
      // Calculate pixels from midnight (each hour is 52px, each 30 min is 26px)
      const pixelsFromMidnight = (hours * 52) + (minutes * (52/60));
      
      return `${pixelsFromMidnight}px`;
    } catch (error) {
      console.error('Error calculating position for time:', timeStr, error);
      return '0px';
    }
  };

  const getEventWidth = (title: string) => {
    const baseWidth = Math.min(Math.max(title.length * 8, 140), 300);
    return `${baseWidth}px`;
  };

  const calculateSlotHeight = (startTime: string, endTime: string) => {
    try {
      // Parse start and end times
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      
      // Calculate total minutes difference
      const startTotalMinutes = startHours * 60 + startMinutes;
      const endTotalMinutes = endHours * 60 + endMinutes;
      const diffInMinutes = endTotalMinutes - startTotalMinutes;
      
      // Convert to pixels (52px per hour, so 26px per 30 minutes)
      return `${(diffInMinutes * (52/60))}px`;
    } catch (error) {
      console.error('Error calculating slot height:', error);
      return '26px';
    }
  };

  return (
    <div className="w-[800px] bg-background border border-border rounded-lg p-4">
      <div className="space-y-4">
        <div>
          <h3 className="font-medium text-lg">
            {formatInTimeZone(date, timezone, 'MMMM d, yyyy')}
          </h3>
          <p className="text-sm text-muted-foreground">
            Timezone: {timezone}
          </p>
        </div>

        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="relative grid grid-cols-[80px_1fr] gap-4">
            <TimeGrid timezone={timezone} />

            <div className="relative border-l border-border min-h-[1248px]">
              {Array.from({ length: 48 }, (_, index) => (
                <div
                  key={index}
                  className="absolute w-full border-t border-border/30"
                  style={{ top: `${index * 26}px` }}
                />
              ))}

              {events.map((event) => (
                <div
                  key={event.id}
                  className={cn(
                    "absolute left-2 p-3 rounded-lg transition-all duration-200",
                    "shadow-sm",
                    event.status !== 'cancelled' && "hover:shadow-md hover:translate-y-[-1px]",
                    getEventColor(
                      event.event_type, 
                      event.status,
                      event.session_details?.session_type?.type
                    )
                  )}
                  style={{
                    top: getEventPosition(event.start_time.split('T')[1]),
                    width: getEventWidth(event.title),
                    minHeight: '44px',
                    zIndex: 10
                  }}
                  onClick={() => event.status !== 'cancelled' && onEventClick?.(event)}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm leading-tight truncate">
                        {event.title}
                      </h4>
                      {event.status === 'cancelled' && (
                        <span className="text-red-500 text-xs font-medium">(Cancelled)</span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatInTimeZone(new Date(event.start_time), timezone, 'h:mm a')}
                    </span>
                  </div>
                </div>
              ))}

              {isMentor && availability.map((slot, index) => {
                const slotDate = new Date(date);
                const [startHour, startMinute] = slot.start_time.split(':').map(Number);
                const [endHour, endMinute] = slot.end_time.split(':').map(Number);
                
                slotDate.setHours(startHour, startMinute);
                const startTimeInUserTz = formatInTimeZone(slotDate, timezone, 'HH:mm');
                
                return (
                  <div
                    key={`${slot.date_available}-${slot.start_time}-${index}`}
                    className="absolute left-2 right-2 p-3 rounded-lg border border-purple-500/30 bg-purple-500/20 hover:bg-purple-500/30 hover:border-purple-500/40 transition-colors"
                    style={{
                      top: getEventPosition(startTimeInUserTz),
                      height: calculateSlotHeight(slot.start_time, slot.end_time),
                      zIndex: 5
                    }}
                  >
                    <div className="flex flex-col gap-1">
                      <h4 className="font-medium text-sm leading-tight truncate">
                        Available for Booking
                      </h4>
                      <span className="text-xs text-muted-foreground">
                        {formatInTimeZone(slotDate, timezone, 'h:mm a')} - 
                        {formatInTimeZone(
                          new Date(slotDate).setHours(endHour, endMinute),
                          timezone,
                          'h:mm a'
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}