import React from 'react';
import { formatInTimeZone } from 'date-fns-tz';
import { cn } from "@/lib/utils";
import { CalendarEvent } from "@/types/calendar";

interface EventSlotProps {
  event: CalendarEvent;
  timezone: string;
  onEventClick?: (event: CalendarEvent) => void;
  cellHeight: number;
}

export function EventSlot({ event, timezone, onEventClick, cellHeight }: EventSlotProps) {
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
    const date = new Date(timeStr);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return hours * cellHeight * 2 + (minutes / 30) * cellHeight;
  };

  const calculateEventHeight = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffInMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    return (diffInMinutes / 30) * cellHeight;
  };

  return (
    <div
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
        top: `${getEventPosition(event.start_time)}px`,
        width: '140px',
        height: `${calculateEventHeight(event.start_time, event.end_time)}px`,
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
  );
}