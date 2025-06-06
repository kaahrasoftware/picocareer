
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { Availability } from "@/types/calendar";

interface AvailabilitySlotProps {
  slot: Availability;
  date: Date;
  timezone: string;
  index: number;
  cellHeight: number;
}

export function AvailabilitySlot({ slot, date, timezone, index, cellHeight }: AvailabilitySlotProps) {
  const getSlotPosition = (dateTime: string) => {
    const date = new Date(dateTime);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return (hours * cellHeight * 2 + (minutes / 30) * cellHeight);
  };

  const calculateSlotHeight = (startDateTime: string, endDateTime: string) => {
    const start = new Date(startDateTime);
    const end = new Date(endDateTime);
    const diffInMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    return (diffInMinutes / 30) * cellHeight;
  };

  const slotStyle = slot.is_available
    ? "border-purple-500/30 bg-purple-500/20 hover:bg-purple-500/30 hover:border-purple-500/40"
    : "border-red-500/30 bg-red-500/20 hover:bg-red-500/30 hover:border-red-500/40";

  return (
    <div
      key={`${slot.start_date_time}-${index}`}
      className={`absolute left-2 right-2 p-3 rounded-lg border transition-colors z-10 ${slotStyle}`}
      style={{
        top: `${getSlotPosition(slot.start_date_time) + cellHeight}px`,
        height: `${calculateSlotHeight(slot.start_date_time, slot.end_date_time)}px`,
      }}
    >
      <div className="flex flex-col gap-1">
        <h4 className="font-medium text-sm leading-tight truncate">
          {slot.is_available ? "Available for Booking" : "Unavailable"}
          {slot.recurring && " (Recurring)"}
        </h4>
        <span className="text-xs text-muted-foreground">
          {formatInTimeZone(new Date(slot.start_date_time), timezone, 'h:mm a')} - 
          {formatInTimeZone(new Date(slot.end_date_time), timezone, ' h:mm a')}
        </span>
      </div>
    </div>
  );
}
