import { TimeSlotButton } from "./TimeSlotButton";

interface TimeSlotsGridProps {
  title?: string;
  timeSlots: Array<{ time: string; available: boolean }>;
  selectedTime: string | undefined;
  onTimeSelect: (time: string) => void;
}

export function TimeSlotsGrid({
  title,
  timeSlots,
  selectedTime,
  onTimeSelect
}: TimeSlotsGridProps) {
  if (!timeSlots.length) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground">No time slots available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {title && (
        <h4 className="text-sm font-medium">{title}</h4>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {timeSlots.map((slot) => (
          <TimeSlotButton
            key={slot.time}
            time={slot.time}
            available={slot.available}
            isSelected={selectedTime === slot.time}
            onSelect={onTimeSelect}
          />
        ))}
      </div>
    </div>
  );
}