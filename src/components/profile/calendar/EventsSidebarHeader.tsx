
import { format, isValid } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { CalendarEvent } from "@/types/calendar";

interface EventsSidebarHeaderProps {
  date: Date;
  events: CalendarEvent[];
}

export function EventsSidebarHeader({ date, events }: EventsSidebarHeaderProps) {
  // Handle potential invalid date objects
  const formattedDate = date && isValid(date) 
    ? format(date, "MMMM d, yyyy")
    : "Invalid date";
  
  const scheduleCount = events.filter(e => e.status === "scheduled").length;
  const completedCount = events.filter(e => e.status === "completed").length;
  const cancelledCount = events.filter(e => e.status === "cancelled").length;
  const noShowCount = events.filter(e => e.status === "no_show").length;

  return (
    <div className="mb-4">
      <h3 className="text-xl font-semibold mb-2">{formattedDate}</h3>
      
      <div className="flex flex-wrap gap-2">
        {events.length > 0 ? (
          <>
            {scheduleCount > 0 && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                {scheduleCount} Scheduled
              </Badge>
            )}
            
            {completedCount > 0 && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
                {completedCount} Completed
              </Badge>
            )}
            
            {cancelledCount > 0 && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                {cancelledCount} Cancelled
              </Badge>
            )}
            
            {noShowCount > 0 && (
              <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-200">
                {noShowCount} No-Show
              </Badge>
            )}
          </>
        ) : (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            No events
          </Badge>
        )}
      </div>
    </div>
  );
}
