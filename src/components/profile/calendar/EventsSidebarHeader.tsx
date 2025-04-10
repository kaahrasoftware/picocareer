
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

export interface EventsSidebarHeaderProps {
  date: Date;
  events?: any[];
}

export function EventsSidebarHeader({ date, events = [] }: EventsSidebarHeaderProps) {
  // Make sure we have a valid date
  const isValidDate = date instanceof Date && !isNaN(date.getTime());
  
  // Format the date, but only if it's valid
  const formattedDate = isValidDate 
    ? format(date, "EEEE, MMMM d, yyyy")
    : "Select a date";

  // Count events if we have any
  const eventsCount = Array.isArray(events) ? events.length : 0;

  return (
    <div className="p-4 border-b">
      <div className="flex items-center">
        <CalendarIcon className="w-5 h-5 mr-2 text-primary" />
        <h3 className="font-medium">{formattedDate}</h3>
      </div>
      {isValidDate && (
        <p className="text-sm text-muted-foreground mt-1">
          {eventsCount} {eventsCount === 1 ? 'event' : 'events'} scheduled
        </p>
      )}
    </div>
  );
}
