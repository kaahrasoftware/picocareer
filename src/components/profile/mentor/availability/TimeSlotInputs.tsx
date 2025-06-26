
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface TimeSlotInputsProps {
  timeSlots: any[];
  selectedStartTime: string;
  selectedEndTime: string;
  isRecurring: boolean;
  userTimezone: string;
  onStartTimeSelect: (time: string) => void;
  onEndTimeSelect: (time: string) => void;
  onRecurringChange: () => void;
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
        <div>
          <Label>Start Time</Label>
          <Select value={selectedStartTime} onValueChange={onStartTimeSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Select start time" />
            </SelectTrigger>
            <SelectContent>
              {timeSlots.map((slot) => (
                <SelectItem key={slot} value={slot}>
                  {slot}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>End Time</Label>
          <Select value={selectedEndTime} onValueChange={onEndTimeSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Select end time" />
            </SelectTrigger>
            <SelectContent>
              {timeSlots.map((slot) => (
                <SelectItem key={slot} value={slot}>
                  {slot}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="recurring"
          checked={isRecurring}
          onCheckedChange={onRecurringChange}
        />
        <Label htmlFor="recurring">Repeat weekly</Label>
      </div>

      <div className="text-sm text-muted-foreground">
        Times shown in {userTimezone}
      </div>
    </div>
  );
}
