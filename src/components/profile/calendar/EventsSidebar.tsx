import { ScrollArea } from "@/components/ui/scroll-area";
import { formatInTimeZone } from 'date-fns-tz';
import { isSameDay, isValid } from 'date-fns';
import { CalendarEvent, Availability } from "@/types/calendar";
import { TimeGrid } from "./TimeGrid";
import { TimeGridLines } from "./TimeGridLines";
import { EventSlot } from "./EventSlot";
import { AvailabilitySlot } from "./AvailabilitySlot";

interface EventsSidebarProps {
  date: Date;
  events: CalendarEvent[];
  availability?: Availability[];
  isMentor?: boolean;
  onEventClick?: (event: CalendarEvent) => void;
  onEventDelete?: (event: CalendarEvent) => void;
  timezone?: string;
}

export function EventsSidebar({ 
  date, 
  events, 
  availability = [], 
  isMentor = false, 
  onEventClick,
  onEventDelete,
  timezone = Intl.DateTimeFormat().resolvedOptions().timeZone 
}: EventsSidebarProps) {
  const CELL_HEIGHT = 52;

  // Validate the date
  if (!date || !isValid(date)) {
    console.error('Invalid date provided to EventsSidebar:', date);
    return null;
  }

  // Filter events for the selected date and exclude cancelled events
  const activeEvents = events.filter(event => {
    const eventDate = new Date(event.start_time);
    return isValid(eventDate) && event.status !== 'cancelled' && isSameDay(eventDate, date);
  });

  // Calculate overlapping events and their positions
  const getEventPositions = (events: CalendarEvent[]) => {
    const sortedEvents = [...events].sort((a, b) => 
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );

    const positions = new Map<string, { left: number; width: number }>();
    const overlaps = new Map<string, Set<string>>();

    // Find overlapping events
    for (let i = 0; i < sortedEvents.length; i++) {
      const event = sortedEvents[i];
      const eventStart = new Date(event.start_time);
      const eventEnd = new Date(event.end_time);
      
      if (!isValid(eventStart) || !isValid(eventEnd)) {
        console.error('Invalid event dates:', event);
        continue;
      }

      const overlappingEvents = new Set<string>();

      for (let j = 0; j < sortedEvents.length; j++) {
        if (i === j) continue;
        const otherEvent = sortedEvents[j];
        const otherStart = new Date(otherEvent.start_time);
        const otherEnd = new Date(otherEvent.end_time);

        if (!isValid(otherStart) || !isValid(otherEnd)) {
          continue;
        }

        if (eventStart < otherEnd && eventEnd > otherStart) {
          overlappingEvents.add(otherEvent.id);
        }
      }

      overlaps.set(event.id, overlappingEvents);
    }

    // Calculate positions for each event
    sortedEvents.forEach(event => {
      const overlappingEvents = overlaps.get(event.id) || new Set();
      const totalOverlaps = overlappingEvents.size + 1;
      const usedPositions = new Set<number>();

      // Check positions already taken by overlapping events
      overlappingEvents.forEach(overlapId => {
        const pos = positions.get(overlapId);
        if (pos) {
          usedPositions.add(Math.floor(pos.left / (100 / totalOverlaps)));
        }
      });

      // Find first available position
      let position = 0;
      while (usedPositions.has(position)) {
        position++;
      }

      positions.set(event.id, {
        left: (position * (100 / totalOverlaps)),
        width: (100 / totalOverlaps)
      });
    });

    return positions;
  };

  const eventPositions = getEventPositions(activeEvents);

  try {
    return (
      <div className="w-full lg:w-[600px] bg-background border border-border rounded-lg p-4">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-lg text-center lg:text-left">
              {isValid(date) ? formatInTimeZone(date, timezone, 'MMMM d, yyyy') : 'Invalid Date'}
            </h3>
            <p className="text-sm text-muted-foreground text-center lg:text-left">
              Timezone: {timezone}
            </p>
          </div>

          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="overflow-x-auto">
              <div className="relative grid grid-cols-[80px_1fr] gap-4 min-w-[350px] md:min-w-[500px]">
                <TimeGrid timezone={timezone} cellHeight={CELL_HEIGHT} />

                <div className="relative border-l border-border min-h-[2496px]">
                  <TimeGridLines cellHeight={CELL_HEIGHT} />

                  {isMentor && availability.map((slot, index) => (
                    <AvailabilitySlot
                      key={`${slot.start_date_time}-${index}`}
                      slot={slot}
                      date={date}
                      timezone={timezone}
                      index={index}
                      cellHeight={CELL_HEIGHT}
                    />
                  ))}

                  {activeEvents.map((event) => (
                    <EventSlot
                      key={event.id}
                      event={event}
                      timezone={timezone}
                      onClick={onEventClick}
                      onDelete={onEventDelete}
                      cellHeight={CELL_HEIGHT}
                      position={eventPositions.get(event.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error rendering EventsSidebar:', error);
    return (
      <div className="w-full lg:w-[600px] bg-background border border-border rounded-lg p-4">
        <p className="text-red-500">Error displaying calendar events. Please try again.</p>
      </div>
    );
  }
}