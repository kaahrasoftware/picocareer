import { Availability } from "@/types/calendar";

export interface AvailabilitySlotProps {
  slot: Availability;
  date: Date;
  timezone: string;
  index: number;
  cellHeight: number;
}

export function AvailabilitySlot({ slot, date, timezone, index, cellHeight }: AvailabilitySlotProps) {
  return (
    <div
      style={{
        height: cellHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: slot.is_available ? 'lightgreen' : 'lightcoral',
        border: '1px solid #ccc',
        borderRadius: '4px',
        margin: '2px',
      }}
    >
      <span>{slot.is_available ? 'Available' : 'Unavailable'}</span>
    </div>
  );
}
