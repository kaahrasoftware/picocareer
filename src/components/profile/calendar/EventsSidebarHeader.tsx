import { PlusCircle } from "lucide-react";
import { format, isToday, isValid } from "date-fns";
import { Button } from "@/components/ui/button";
import type { CalendarEvent } from "@/types/calendar";
interface EventsSidebarHeaderProps {
  date: Date;
  events: CalendarEvent[];
}
export function EventsSidebarHeader({
  date,
  events
}: EventsSidebarHeaderProps) {
  // Validate the date before using it
  const isValidDate = date && isValid(date);
  return <div className="flex justify-between items-center mb-4">
      <div>
        <h3 className="text-lg font-semibold">
          {isValidDate ? isToday(date) ? "Today's Sessions" : `Sessions for ${format(date, "MMMM d, yyyy")}` : "Sessions"}
        </h3>
        <p className="text-sm text-muted-foreground">
          {events.length === 0 ? "No sessions scheduled" : `${events.length} session${events.length === 1 ? "" : "s"}`}
        </p>
      </div>
      
    </div>;
}