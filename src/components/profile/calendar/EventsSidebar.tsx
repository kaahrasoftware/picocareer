import { CalendarEvent, Availability } from "@/types/calendar";
import { format } from "date-fns";

export interface EventsSidebarProps {
  events?: CalendarEvent[];
  availability?: Availability[];
  formatEventTime?: (slot: Availability) => string;
  date?: Date;
  isMentor?: boolean;
  onEventDelete?: () => void;
}

export function EventsSidebar({ 
  events = [], // Provide default empty array
  availability = [], // Provide default empty array
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
    <div className="sidebar p-4 border rounded-lg">
      <h2 className="text-lg font-semibold mb-4">Events</h2>
      {events.length === 0 ? (
        <p className="text-muted-foreground">No events scheduled</p>
      ) : (
        <ul className="space-y-3">
          {events.map(event => (
            <li key={event.id} className="event-item p-3 border rounded-md">
              <h3 className="font-medium">{event.title}</h3>
              {event.session_details && (
                <p className="text-sm text-muted-foreground">
                  {format(new Date(event.start_date_time), "h:mm a")}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      <h2 className="text-lg font-semibold mt-6 mb-4">Availability</h2>
      {availability.length === 0 ? (
        <p className="text-muted-foreground">No availability set</p>
      ) : (
        <ul className="space-y-2">
          {availability.map(slot => (
            <li key={slot.id} className="availability-item p-2 border rounded-md">
              <p className="text-sm">{formatTime(slot)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}