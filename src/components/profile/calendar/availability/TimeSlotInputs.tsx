
import React, { useEffect, useState } from 'react';
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { format, parse, isWithinInterval, addDays } from 'date-fns';
import { DateRange } from "react-day-picker";

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
  selectedDateRange?: DateRange;
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
  selectedDateRange,
}: TimeSlotInputsProps) {
  const [existingSlots, setExistingSlots] = useState<ExistingSlot[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchExistingSlots() {
      if (!selectedDate) return;
      
      setLoading(true);
      try {
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);

        // Get user profile ID from the auth session
        const { data: { session } } = await supabase.auth.getSession();
        const profileId = session?.user?.id;

        if (!profileId) {
          console.error('No profile ID available from session');
          return;
        }

        console.log(`Fetching availability for date: ${selectedDate.toISOString()}, day of week: ${selectedDate.getDay()}, profile: ${profileId}`);

        const { data, error } = await supabase
          .from('mentor_availability')
          .select('*')
          .eq('profile_id', profileId)
          .eq('is_available', true)
          .or(`and(start_date_time.gte.${startOfDay.toISOString()},start_date_time.lte.${endOfDay.toISOString()}),and(recurring.eq.true,day_of_week.eq.${selectedDate.getDay()})`);

        if (error) {
          console.error('Error fetching availability:', error);
          return;
        }

        console.log(`Found ${data?.length} existing slots`, data);
        setExistingSlots(data || []);
      } catch (error) {
        console.error('Error in fetchExistingSlots:', error);
      } finally {
        setLoading(false);
      }
    }

    if (selectedDate) {
      fetchExistingSlots();
    }
  }, [selectedDate]);

  const isTimeSlotDisabled = (timeSlot: string) => {
    if (loading || !selectedDate) return false;
    
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

  const getDateRangeText = () => {
    if (!selectedDateRange?.from) return "";
    if (!selectedDateRange.to) return format(selectedDateRange.from, 'MMM d, yyyy');
    
    const daysCount = Math.round((selectedDateRange.to.getTime() - selectedDateRange.from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    return `${format(selectedDateRange.from, 'MMM d')} - ${format(selectedDateRange.to, 'MMM d, yyyy')} (${daysCount} days)`;
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
        <Label htmlFor="recurring">
          {selectedDateRange && selectedDateRange.from && selectedDateRange.to ? 
            "Make this a weekly recurring availability for all selected dates" :
            "Make this a weekly recurring availability"
          }
        </Label>
      </div>

      {selectedDateRange && selectedDateRange.from && (
        <p className="text-sm text-yellow-600 dark:text-yellow-400">
          This time will be applied to: {getDateRangeText()}
        </p>
      )}

      <p className="text-sm text-muted-foreground">
        Times shown in your timezone ({userTimezone})
      </p>
    </div>
  );
}
