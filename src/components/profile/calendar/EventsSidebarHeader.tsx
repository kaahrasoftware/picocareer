
import { PlusCircle } from "lucide-react";
import { format, isToday } from "date-fns";
import { Button } from "@/components/ui/button";
import type { CalendarEvent } from "@/types/calendar";

interface EventsSidebarHeaderProps {
  date: Date;
  events: CalendarEvent[];
}

export function EventsSidebarHeader({ date, events }: EventsSidebarHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-4">
      <div>
        <h3 className="text-lg font-semibold">
          {isToday(date)
            ? "Today's Sessions"
            : `Sessions for ${format(date, "MMMM d, yyyy")}`}
        </h3>
        <p className="text-sm text-muted-foreground">
          {events.length === 0
            ? "No sessions scheduled"
            : `${events.length} session${events.length === 1 ? "" : "s"}`}
        </p>
      </div>
      <Button variant="outline" size="sm" className="gap-1">
        <PlusCircle className="h-4 w-4" /> Book
      </Button>
    </div>
  );
}
