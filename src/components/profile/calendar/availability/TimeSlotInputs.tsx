import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface TimeSlotInputsProps {
  timeSlots: string[];
  selectedStartTime?: string;
  selectedEndTime?: string;
  isRecurring: boolean;
  userTimezone: string;
  onStartTimeSelect: (time: string) => void;
  onEndTimeSelect: (time: string) => void;
  onRecurringChange: (value: boolean) => void;
}

export function TimeSlotInputs({
  timeSlots,
  selectedStartTime,
  selectedEndTime,
  isRecurring,
  userTimezone,
  onStartTimeSelect,
  onEndTimeSelect,
  onRecurringChange
}: TimeSlotInputsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Time</Label>
          <Select value={selectedStartTime} onValueChange={onStartTimeSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Select start time" />
            </SelectTrigger>
            <SelectContent>
              {timeSlots.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>End Time</Label>
          <Select value={selectedEndTime} onValueChange={onEndTimeSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Select end time" />
            </SelectTrigger>
            <SelectContent>
              {timeSlots.map((time) => (
                <SelectItem 
                  key={time} 
                  value={time}
                  disabled={selectedStartTime ? time <= selectedStartTime : false}
                >
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label>Recurring Weekly</Label>
        <Switch
          checked={isRecurring}
          onCheckedChange={onRecurringChange}
        />
      </div>

      <p className="text-sm text-muted-foreground">
        Times are shown in your timezone ({userTimezone})
      </p>
    </div>
  );
}