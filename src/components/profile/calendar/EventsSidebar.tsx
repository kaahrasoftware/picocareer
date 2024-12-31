import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarEvent, Availability } from "@/types/calendar";
import { format, isToday } from "date-fns";
import { EventSlot } from "./EventSlot";
import { AvailabilitySlot } from "./AvailabilitySlot";

interface EventsSidebarProps {
  date: Date;
  events: CalendarEvent[];
  availability: Availability[];
  isMentor: boolean;
  onEventClick?: (event: CalendarEvent) => void;
  onEventDelete?: (event: CalendarEvent) => void;
}

export function EventsSidebar({
  date,
  events,
  availability,
  isMentor,
  onEventClick,
  onEventDelete
}: EventsSidebarProps) {
  const dateEvents = events.filter(event => {
    const eventDate = new Date(event.start_time);
    return (
      eventDate.getDate() === date.getDate() &&
      eventDate.getMonth() === date.getMonth() &&
      eventDate.getFullYear() === date.getFullYear()
    );
  });

  const cellHeight = 30;

  return (
    <Card className="w-[300px] p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold">
            {isToday(date) ? "Today" : format(date, "MMMM d, yyyy")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {dateEvents.length} events
          </p>
        </div>
      </div>

      <ScrollArea className="h-[600px] relative">
        <div className="relative">
          {/* Time grid lines */}
          {Array.from({ length: 24 * 2 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-full border-t border-border"
              style={{ top: `${i * cellHeight}px`, height: `${cellHeight}px` }}
            >
              {i % 2 === 0 && (
                <span className="absolute -left-2 -top-3 text-xs text-muted-foreground">
                  {`${Math.floor(i / 2)}:00`}
                </span>
              )}
            </div>
          ))}

          {/* Events */}
          {dateEvents.map((event) => (
            <EventSlot
              key={event.id}
              event={event}
              cellHeight={cellHeight}
              onClick={() => onEventClick?.(event)}
              onDelete={() => onEventDelete?.(event)}
            />
          ))}

          {/* Availability slots */}
          {availability.map((slot, index) => (
            <AvailabilitySlot
              key={`${slot.start_date_time}-${index}`}
              slot={slot}
              date={date}
              timezone="UTC"
              index={index}
              cellHeight={cellHeight}
            />
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}