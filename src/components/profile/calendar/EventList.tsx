import { format } from "date-fns";
import { Availability, CalendarEvent } from "@/types/calendar";

interface EventListProps {
  events: CalendarEvent[];
  availability: Availability[];
}

const formatEventTime = (slot: Availability) => {
  return `${format(new Date(slot.start_date_time!), 'HH:mm')} - ${format(new Date(slot.end_date_time!), 'HH:mm')}`;
};

export const EventList: React.FC<EventListProps> = ({ events, availability }) => {
  return (
    <div>
      {events.map(event => (
        <div key={event.id} className="event-item">
          <h3>{event.title}</h3>
          <p>{format(new Date(event.start_time), 'HH:mm')} - {format(new Date(event.end_time), 'HH:mm')}</p>
        </div>
      ))}
      {availability.map(slot => (
        <div key={slot.id} className="availability-item">
          <p>{formatEventTime(slot)}</p>
        </div>
      ))}
    </div>
  );
};