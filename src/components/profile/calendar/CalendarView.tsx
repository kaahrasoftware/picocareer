import { CalendarEvent, Availability } from "@/types/calendar";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";

export interface CalendarViewProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  events: CalendarEvent[];
  availability: Availability[];
}

export function CalendarView({ selectedDate, setSelectedDate, events, availability }: CalendarViewProps) {
  const getDateContent = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const hasEvent = events.some(event => event.start_time.startsWith(formattedDate));
    const hasAvailability = availability.some(slot => 
      slot.start_time && slot.start_time.startsWith(formattedDate)
    );

    if (hasEvent && hasAvailability) {
      return <div className="w-2 h-2 bg-primary rounded-full mx-auto mt-1" />;
    } else if (hasEvent) {
      return <div className="w-2 h-2 bg-secondary rounded-full mx-auto mt-1" />;
    } else if (hasAvailability) {
      return <div className="w-2 h-2 bg-accent rounded-full mx-auto mt-1" />;
    }

    return null;
  };

  return (
    <Card className="p-4">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={(date) => date && setSelectedDate(date)}
        className="rounded-md"
        components={{
          DayContent: ({ date }) => (
            <>
              {date.getDate()}
              {getDateContent(date)}
            </>
          ),
        }}
      />
    </Card>
  );
}