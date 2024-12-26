import { TimeSlotSelector } from "@/components/booking/TimeSlotSelector";
import { Button } from "@/components/ui/button";

interface TimeSlotPickerProps {
  selectedStartTime?: string;
  selectedEndTime?: string;
  onStartTimeSelect: (time: string) => void;
  onEndTimeSelect: (time: string) => void;
  onSave: () => void;
  mentorId: string;
}

export function TimeSlotPicker({ 
  selectedStartTime,
  selectedEndTime,
  onStartTimeSelect,
  onEndTimeSelect,
  onSave,
  mentorId
}: TimeSlotPickerProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <TimeSlotSelector
            date={new Date()}
            mentorId={mentorId}
            selectedTime={selectedStartTime}
            onTimeSelect={onStartTimeSelect}
            selectedSessionType={undefined}
          />
        </div>
        <div>
          <TimeSlotSelector
            date={new Date()}
            mentorId={mentorId}
            selectedTime={selectedEndTime}
            onTimeSelect={onEndTimeSelect}
            selectedSessionType={undefined}
            title="End Time"
          />
        </div>
      </div>
      <Button 
        onClick={onSave}
        disabled={!selectedStartTime || !selectedEndTime}
        className="w-full"
      >
        Save Availability
      </Button>
    </div>
  );
}