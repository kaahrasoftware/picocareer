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
            <p className="event-time">{formatEventTime(event.session_details?.scheduled_at)}</p>
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
