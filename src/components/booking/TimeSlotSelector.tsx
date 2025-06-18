
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { MentorSessionType } from "@/types/database/mentors";

interface TimeSlotSelectorProps {
  selectedSessionType: MentorSessionType | null;
  onSessionTypeSelect: (sessionType: MentorSessionType) => void;
  availableSlots: string[];
  selectedSlot: string | null;
  onSlotSelect: (slot: string) => void;
}

export function TimeSlotSelector({
  selectedSessionType,
  onSessionTypeSelect,
  availableSlots,
  selectedSlot,
  onSlotSelect
}: TimeSlotSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Available Time Slots</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {availableSlots.map((slot) => (
            <Card
              key={slot}
              className={`cursor-pointer transition-colors ${
                selectedSlot === slot
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
              onClick={() => onSlotSelect(slot)}
            >
              <CardContent className="p-3 text-center">
                <span className="text-sm font-medium">{slot}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
