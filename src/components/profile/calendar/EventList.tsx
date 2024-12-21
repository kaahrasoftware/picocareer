import React from "react";
import { format, parse, isValid } from "date-fns";

export interface Event {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  event_type: 'session' | 'webinar' | 'holiday';
  created_at: string;
  updated_at: string;
}

interface Availability {
  date_available: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface EventListProps {
  events: Event[];
  availability?: Availability[];
  isMentor?: boolean;
}

export function EventList({ events, availability = [], isMentor = false }: EventListProps) {
  const getEventColor = (type: Event['event_type']) => {
    switch (type) {
      case 'session':
        return 'border-blue-500/20 bg-blue-500/10';
      case 'webinar':
        return 'border-green-500/20 bg-green-500/10';
      case 'holiday':
        return 'border-yellow-500/20 bg-yellow-500/10';
      default:
        return 'border-gray-500/20 bg-gray-500/10';
    }
  };

  const formatTimeString = (timeStr: string) => {
    try {
      // Handle ISO datetime strings
      if (timeStr.includes('T')) {
        const date = new Date(timeStr);
        if (isValid(date)) {
          return format(date, 'h:mm a');
        }
      }
      
      // Handle date strings (YYYY-MM-DD)
      if (timeStr.includes('-') && timeStr.length === 10) {
        const date = new Date(timeStr);
        if (isValid(date)) {
          return format(date, 'h:mm a');
        }
      }
      
      // Handle time-only strings (HH:mm)
      if (timeStr.match(/^\d{2}:\d{2}$/)) {
        const date = parse(timeStr, 'HH:mm', new Date());
        if (isValid(date)) {
          return format(date, 'h:mm a');
        }
      }
      
      console.error('Invalid time format:', timeStr);
      return timeStr; // Return original string if all parsing attempts fail
    } catch (error) {
      console.error('Error formatting time:', timeStr, error);
      return timeStr;
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
          className={`p-3 rounded-lg border ${getEventColor(event.event_type)}`}
        >
          <div className="flex justify-between items-start">
            <h4 className="font-medium">{event.title}</h4>
            <span className="text-sm text-muted-foreground">
              {formatTimeString(event.start_time)}
            </span>
          </div>
          {event.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {event.description}
            </p>
          )}
        </div>
      ))}

      {isMentor && availability.map((slot, index) => (
        <div
          key={`${slot.date_available}-${slot.start_time}-${index}`}
          className="p-3 rounded-lg border border-purple-500/20 bg-purple-500/10"
        >
          <div className="flex justify-between items-start">
            <h4 className="font-medium">Available for Booking</h4>
            <span className="text-sm text-muted-foreground">
              {formatTimeString(slot.start_time)} - {formatTimeString(slot.end_time)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}