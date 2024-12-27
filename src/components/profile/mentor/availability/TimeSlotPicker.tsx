import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  // Generate time slots for the full day in 30-minute increments
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium mb-2">Start Time</h4>
        <Select
          value={selectedStartTime}
          onValueChange={onStartTimeSelect}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select start time" />
          </SelectTrigger>
          <SelectContent>
            {timeSlots.map((time) => (
              <SelectItem 
                key={time} 
                value={time}
                disabled={selectedEndTime ? time >= selectedEndTime : false}
              >
                {time}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <h4 className="font-medium mb-2">End Time</h4>
        <Select
          value={selectedEndTime}
          onValueChange={onEndTimeSelect}
        >
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