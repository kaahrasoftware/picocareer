import { format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { CalendarEvent, Availability } from "@/types/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EventListProps {
  date: Date;
  events: CalendarEvent[];
  availability?: Availability[];
  timezone?: string;
  onEventClick?: (event: CalendarEvent) => void;
}

export function EventList({ 
  date, 
  events, 
  availability = [], 
  timezone = 'UTC',
  onEventClick 
}: EventListProps) {
  // Filter events for the selected date
  const dateEvents = events.filter(event => {
    const eventDate = new Date(event.start_time);
    return format(eventDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
  });

  // Filter availability for the selected date
  const dateAvailability = availability.filter(slot => {
    if (slot.recurring) {
      return slot.day_of_week === date.getDay();
    }
    const slotDate = new Date(slot.start_time);
    return format(slotDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
  });

  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-2 p-2">
        {dateEvents.map((event) => (
          <Card 
            key={event.id}
            className="cursor-pointer hover:shadow-md transition-all"
            onClick={() => onEventClick?.(event)}
          >
            <CardContent className="p-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{event.title}</h4>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatInTimeZone(new Date(event.start_time), timezone, 'h:mm a')}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}

        {dateAvailability.map((slot, index) => (
          <Card key={`${slot.id}-${index}`} className="border-green-500/20 bg-green-500/10">
            <CardContent className="p-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">Available</h4>
                  {slot.recurring && (
                    <p className="text-sm text-muted-foreground">Recurring weekly</p>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatInTimeZone(new Date(slot.start_time), timezone, 'h:mm a')} - 
                  {formatInTimeZone(new Date(slot.end_time), timezone, 'h:mm a')}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}