import { CalendarEvent, Availability } from "@/types/calendar";
import { format } from "date-fns";

export interface EventsSidebarProps {
  events: CalendarEvent[];
  availability: Availability[];
  formatEventTime?: (slot: Availability) => string;
  date?: Date;
  isMentor?: boolean;
  onEventDelete?: () => void;
}

export function EventsSidebar({ 
  events, 
  availability, 
  formatEventTime,
  date,
  isMentor,
  onEventDelete 
}: EventsSidebarProps) {
  const defaultFormatTime = (slot: Availability) => {
    return format(new Date(slot.start_date_time), "h:mm a");
  };

  const formatTime = formatEventTime || defaultFormatTime;

  return (
    <div className="sidebar">
      <h2 className="text-lg font-semibold">Events</h2>
      <ul>
        {events.map(event => (
          <li key={event.id} className="event-item">
            <h3 className="event-title">{event.title}</h3>
            {event.session_details && (
              <p className="event-time">
                {format(new Date(event.start_date_time), "h:mm a")}
              </p>
            )}
          </li>
        ))}
      </ul>
      <h2 className="text-lg font-semibold">Availability</h2>
      <ul>
        {availability.map(slot => (
          <li key={slot.id} className="availability-item">
            <p className="availability-time">{formatTime(slot)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}