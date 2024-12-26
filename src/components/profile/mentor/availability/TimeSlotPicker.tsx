import { TimeSlotSelector } from "@/components/booking/TimeSlotSelector";
import { Button } from "@/components/ui/button";

interface TimeSlotPickerProps {
  selectedStartTime?: string;
  selectedEndTime?: string;
  onStartTimeSelect: (time: string) => void;
  onEndTimeSelect: (time: string) => void;
  onSave: () => void;
  timeSlots: Array<{ time: string; available: boolean; }>;
}

export function TimeSlotPicker({ 
  selectedStartTime,
  selectedEndTime,
  onStartTimeSelect,
  onEndTimeSelect,
  onSave,
  timeSlots
}: TimeSlotPickerProps) {
  return (
    <div className="space-y-4">
      <h4 className="font-medium">Set Available Hours</h4>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <TimeSlotSelector
            date={new Date()}
            availableTimeSlots={timeSlots}
            selectedTime={selectedStartTime}
            onTimeSelect={onStartTimeSelect}
            selectedSessionType={undefined}
          />
        </div>
        <div>
          <TimeSlotSelector
            date={new Date()}
            availableTimeSlots={timeSlots.filter(slot => 
              !selectedStartTime || slot.time > selectedStartTime
            )}
            selectedTime={selectedEndTime}
            onTimeSelect={onEndTimeSelect}
            selectedSessionType={undefined}
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