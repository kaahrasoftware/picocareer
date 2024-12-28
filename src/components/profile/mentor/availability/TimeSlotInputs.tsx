import React from 'react';
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

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
  onRecurringChange,
}: TimeSlotInputsProps) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium mb-2">Start Time</h4>
        <select
          value={selectedStartTime}
          onChange={(e) => onStartTimeSelect(e.target.value)}
          className="w-full border border-input bg-background px-3 py-2 rounded-md"
        >
          <option value="">Select start time</option>
          {timeSlots.map((time) => (
            <option 
              key={time} 
              value={time}
              disabled={selectedEndTime ? time >= selectedEndTime : false}
            >
              {time}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h4 className="font-medium mb-2">End Time</h4>
        <select
          value={selectedEndTime}
          onChange={(e) => onEndTimeSelect(e.target.value)}
          className="w-full border border-input bg-background px-3 py-2 rounded-md"
        >
          <option value="">Select end time</option>
          {timeSlots.map((time) => (
            <option 
              key={time} 
              value={time}
              disabled={selectedStartTime ? time <= selectedStartTime : false}
            >
              {time}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="recurring"
          checked={isRecurring}
          onCheckedChange={onRecurringChange}
        />
        <Label htmlFor="recurring">Make this a weekly recurring availability</Label>
      </div>

      <p className="text-sm text-muted-foreground">
        Times shown in your timezone ({userTimezone})
      </p>
    </div>
  );
}