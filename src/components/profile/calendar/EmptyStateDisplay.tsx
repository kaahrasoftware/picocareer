
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { isToday } from "date-fns";

interface EmptyStateDisplayProps {
  date: Date;
}

export function EmptyStateDisplay({ date }: EmptyStateDisplayProps) {
  return (
    <div className="text-center py-8">
      <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
      <h3 className="mt-2 text-sm font-semibold">No Sessions</h3>
      <p className="text-sm text-muted-foreground">
        {isToday(date)
          ? "You have no sessions scheduled for today."
          : `No sessions scheduled for ${format(date, "MMMM d")}.`}
      </p>
    </div>
  );
}
