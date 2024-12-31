import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

interface TimeGridProps {
  timezone: string;
  cellHeight: number;
}

export function TimeGrid({ timezone, cellHeight }: TimeGridProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const now = new Date();
  const zonedDate = toZonedTime(now, timezone);

  return (
    <div className="relative">
      {hours.map((hour) => (
        <div
          key={hour}
          className="flex items-start justify-end pr-2 text-xs text-muted-foreground"
          style={{ height: `${cellHeight * 2}px` }}
        >
          <span className="sticky top-0">
            {format(
              toZonedTime(
                new Date(zonedDate.setHours(hour, 0, 0, 0)),
                timezone
              ),
              "h aa"
            )}
          </span>
        </div>
      ))}
    </div>
  );
}