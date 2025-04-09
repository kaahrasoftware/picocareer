
import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { format, addMinutes, parse, setHours, setMinutes } from "date-fns";

interface TimeSlotSelectorProps {
  selectedTime: string;
  onTimeChange: (time: string) => void;
  interval?: number; // minutes between time slots
  showTimeSlots?: boolean;
  startTime?: string; // HH:mm format
  endTime?: string; // HH:mm format
  duration?: number; // duration in minutes for time slot buttons
}

export function TimeSlotSelector({
  selectedTime,
  onTimeChange,
  interval = 30,
  showTimeSlots = false,
  startTime = "09:00",
  endTime = "17:00",
  duration = 60
}: TimeSlotSelectorProps) {
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [visibleTimeSlots, setVisibleTimeSlots] = useState<string[]>([]);

  // Prepare time slots
  useEffect(() => {
    const slots: string[] = [];
    const now = new Date();
    const start = parse(startTime, "HH:mm", now);
    const end = parse(endTime, "HH:mm", now);

    let current = start;
    while (current <= end) {
      slots.push(format(current, "HH:mm"));
      current = addMinutes(current, interval);
    }

    setAvailableTimeSlots(slots);
    if (showTimeSlots) {
      setVisibleTimeSlots(slots.slice(0, 6)); // Show first 6 slots by default
    }
  }, [startTime, endTime, interval, showTimeSlots]);

  const handleTimeSelection = (time: string) => {
    onTimeChange(time);
  };

  // Get more time slots
  const handleMoreTimeSlots = () => {
    const additionalSlots = availableTimeSlots.slice(
      visibleTimeSlots.length,
      visibleTimeSlots.length + 6
    );
    setVisibleTimeSlots([...visibleTimeSlots, ...additionalSlots]);
  };

  return (
    <div className="space-y-4">
      <Select
        value={selectedTime}
        onValueChange={handleTimeSelection}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a time" />
        </SelectTrigger>
        <SelectContent>
          {availableTimeSlots.map((time) => (
            <SelectItem key={time} value={time}>
              {time}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showTimeSlots && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {visibleTimeSlots.map((time) => {
              // Check if this timeslot would end after available hours
              const timeObj = parse(time, "HH:mm", new Date());
              const endTimeObj = addMinutes(timeObj, duration);
              const isValidSlot = endTimeObj <= parse(endTime, "HH:mm", new Date());

              return (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTimeSelection(time)}
                  disabled={!isValidSlot}
                  className={!isValidSlot ? "opacity-50" : ""}
                >
                  {time}
                </Button>
              );
            })}
          </div>

          {visibleTimeSlots.length < availableTimeSlots.length && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMoreTimeSlots}
              className="w-full text-primary"
            >
              Show more time slots
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
