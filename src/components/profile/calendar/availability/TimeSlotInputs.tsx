import React, { useEffect, useState } from 'react';
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { format, parse, isWithinInterval } from 'date-fns';

interface TimeSlotInputsProps {
  timeSlots: string[];
  selectedStartTime?: string;
  selectedEndTime?: string;
  isRecurring: boolean;
  userTimezone: string;
  selectedDate: Date;
  onStartTimeSelect: (time: string) => void;
  onEndTimeSelect: (time: string) => void;
  onRecurringChange: (value: boolean) => void;
}

interface ExistingSlot {
  start_date_time: string;
  end_date_time: string;
  recurring: boolean;
  day_of_week: number | null;
}

export function TimeSlotInputs({
  timeSlots,
  selectedStartTime,
  selectedEndTime,
  isRecurring,
  userTimezone,
  selectedDate,
  onStartTimeSelect,
  onEndTimeSelect,
  onRecurringChange,
}: TimeSlotInputsProps) {
  const [existingSlots, setExistingSlots] = useState<ExistingSlot[]>([]);

  useEffect(() => {
    async function fetchExistingSlots() {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('mentor_availability')
        .select('*')
        .eq('profile_id', (await supabase.auth.getUser()).data.user?.id)
        .eq('is_available', true)
        .or(`and(start_date_time.gte.${startOfDay.toISOString()},start_date_time.lte.${endOfDay.toISOString()}),and(recurring.eq.true,day_of_week.eq.${selectedDate.getDay()})`);

      if (error) {
        console.error('Error fetching availability:', error);
        return;
      }

      setExistingSlots(data || []);
    }

    if (selectedDate) {
      fetchExistingSlots();
    }
  }, [selectedDate]);

  const isTimeSlotDisabled = (timeSlot: string) => {
    const timeToCheck = parse(timeSlot, 'HH:mm', selectedDate);

    return existingSlots.some(slot => {
      let slotStart: Date;
      let slotEnd: Date;

      if (slot.recurring) {
        const recurringStart = new Date(slot.start_date_time);
        const recurringEnd = new Date(slot.end_date_time);
        
        slotStart = new Date(selectedDate);
        slotStart.setHours(recurringStart.getHours(), recurringStart.getMinutes(), 0, 0);
        
        slotEnd = new Date(selectedDate);
        slotEnd.setHours(recurringEnd.getHours(), recurringEnd.getMinutes(), 0, 0);
      } else {
        slotStart = new Date(slot.start_date_time);
        slotEnd = new Date(slot.end_date_time);
      }

      return isWithinInterval(timeToCheck, { start: slotStart, end: slotEnd });
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
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
                disabled={isTimeSlotDisabled(time) || (selectedEndTime ? time >= selectedEndTime : false)}
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
                disabled={isTimeSlotDisabled(time) || (selectedStartTime ? time <= selectedStartTime : false)}
              >
                {time}
              </option>
            ))}
          </select>
        </div>
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