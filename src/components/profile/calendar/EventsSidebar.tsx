import { CalendarEvent, Availability } from "@/types/calendar";

export interface EventsSidebarProps {
  events: CalendarEvent[];
  availability: Availability[];
  formatEventTime: (slot: Availability) => string;
}

export function EventsSidebar({ events, availability, formatEventTime }: EventsSidebarProps) {
  return (
    <div className="sidebar">
      <h2 className="text-lg font-semibold">Events</h2>
      <ul>
        {events.map(event => (
          <li key={event.id} className="event-item">
            <h3 className="event-title">{event.title}</h3>
            {event.session_details && (
              <p className="event-time">
                {formatEventTime({
                  ...event.session_details,
                  start_date_time: event.session_details.scheduled_at,
                  end_date_time: new Date(new Date(event.session_details.scheduled_at).getTime() + 
                    (event.session_details.session_type.duration * 60 * 1000)).toISOString(),
                  is_available: true,
                  recurring: false,
                  id: event.id
                })}
              </p>
            )}
          </li>
        ))}
      </ul>
      <h2 className="text-lg font-semibold">Availability</h2>
      <ul>
        {availability.map(slot => (
          <li key={slot.id} className="availability-item">
            <p className="availability-time">{formatEventTime(slot)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}