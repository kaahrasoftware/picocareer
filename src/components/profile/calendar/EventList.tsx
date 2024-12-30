import React from "react";
import { format, parse, isValid } from "date-fns";
import { CalendarEvent, Availability } from "@/types/calendar";
import { formatInTimeZone } from 'date-fns-tz';

interface EventListProps {
  events: CalendarEvent[];
  availability?: Availability[];
  isMentor?: boolean;
  onEventClick?: (event: CalendarEvent) => void;
  timezone?: string;
}

export function EventList({ 
  events, 
  availability = [], 
  isMentor = false, 
  onEventClick,
  timezone = Intl.DateTimeFormat().resolvedOptions().timeZone 
}: EventListProps) {
  const getEventColor = (type: CalendarEvent['event_type'], status?: string) => {
    if (type === 'session' && status === 'cancelled') {
      return 'border-red-500/20 bg-red-500/10';
    }
    
    switch (type) {
      case 'session':
        return 'border-blue-500/20 bg-blue-500/10';
      default:
        return 'border-gray-500/20 bg-gray-500/10';
    }
  };

  if (events.length === 0 && (!isMentor || availability.length === 0)) {
    return <p className="text-muted-foreground">No events scheduled for this day.</p>;
  }

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <div
          key={event.id}
          className={`p-3 rounded-lg border ${getEventColor(event.event_type, event.status)} cursor-pointer hover:opacity-80 transition-opacity`}
          onClick={() => onEventClick?.(event)}
        >
          <div className="flex justify-between items-start">
            <h4 className="font-medium">{event.title}</h4>
            <span className="text-sm text-muted-foreground">
              {formatInTimeZone(new Date(event.start_time), timezone, 'h:mm a')}
            </span>
          </div>
          {event.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {event.description}
            </p>
          )}
          {event.status === 'cancelled' && (
            <span className="text-sm text-red-500 mt-1 block">
              Cancelled
            </span>
          )}
        </div>
      ))}

      {isMentor && availability.map((slot, index) => (
        <div
          key={`${slot.start_date_time}-${index}`}
          className="p-3 rounded-lg border border-purple-500/20 bg-purple-500/10"
        >
          <div className="flex justify-between items-start">
            <h4 className="font-medium">Available for Booking</h4>
            <span className="text-sm text-muted-foreground">
              {formatInTimeZone(new Date(slot.start_date_time), timezone, 'h:mm a')} - 
              {formatInTimeZone(new Date(slot.end_date_time), timezone, ' h:mm a')}
            </span>
          </div>
          {slot.recurring && (
            <span className="text-sm text-muted-foreground mt-1 block">
              Recurring weekly
            </span>
          )}
        </div>
      ))}
    </div>
  );
}