import { DatePicker } from "@/components/ui/date-picker";
import { SessionTypeSelector } from "./SessionTypeSelector";
import { TimeSlotSelector } from "./TimeSlotSelector";

interface TimeSlotFormProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  selectedTime: string | undefined;
  onTimeSelect: (time: string) => void;
  selectedSessionType: string | undefined;
  onSessionTypeSelect: (type: string) => void;
}

export function TimeSlotForm({
  selectedDate,
  onDateSelect,
  selectedTime,
  onTimeSelect,
  selectedSessionType,
  onSessionTypeSelect,
}: TimeSlotFormProps) {
  return (
    <div className="space-y-4 my-4">
      <div>
        <label className="text-sm font-medium">Select Date</label>
        <DatePicker
          date={selectedDate}
          onSelect={onDateSelect}
        />
      </div>

      <SessionTypeSelector
        value={selectedSessionType}
        onChange={onSessionTypeSelect}
      />

      {selectedDate && (
        <TimeSlotSelector
          date={selectedDate}
          mentorId=""
          selectedTime={selectedTime}
          onTimeSelect={onTimeSelect}
          selectedSessionType={undefined}
          title="Select Time"
        />
      )}
    </div>
  );
}