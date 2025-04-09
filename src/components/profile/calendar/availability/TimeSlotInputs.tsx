
import React, { useEffect, useState } from 'react';
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { format, parse, isWithinInterval, addDays } from 'date-fns';
import { DateRange } from "react-day-picker";
import { Clock, Calendar, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

  // Group time slots by hour for a more structured display
  const groupedTimeSlots: Record<string, string[]> = {};
  timeSlots.forEach(timeSlot => {
    const hour = timeSlot.split(':')[0];
    if (!groupedTimeSlots[hour]) {
      groupedTimeSlots[hour] = [];
    }
    groupedTimeSlots[hour].push(timeSlot);
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex items-center mb-1">
            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
            <Label htmlFor="start-time" className="text-sm font-medium">Start Time</Label>
          </div>
          <div className="relative">
            <select
              id="start-time"
              value={selectedStartTime || ""}
              onChange={(e) => onStartTimeSelect(e.target.value)}
              className="w-full border border-input bg-background px-3 py-2 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">Select start time</option>
              {Object.keys(groupedTimeSlots).sort((a, b) => parseInt(a) - parseInt(b)).map((hour) => (
                <optgroup key={hour} label={`${hour}:00 - ${hour}:59`}>
                  {groupedTimeSlots[hour].map((time) => (
                    <option 
                      key={time} 
                      value={time}
                      disabled={isTimeSlotDisabled(time) || (selectedEndTime ? time >= selectedEndTime : false)}
                    >
                      {format(parse(time, 'HH:mm', new Date()), 'h:mm a')}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center mb-1">
            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
            <Label htmlFor="end-time" className="text-sm font-medium">End Time</Label>
          </div>
          <div className="relative">
            <select
              id="end-time"
              value={selectedEndTime || ""}
              onChange={(e) => onEndTimeSelect(e.target.value)}
              className="w-full border border-input bg-background px-3 py-2 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">Select end time</option>
              {Object.keys(groupedTimeSlots).sort((a, b) => parseInt(a) - parseInt(b)).map((hour) => (
                <optgroup key={hour} label={`${hour}:00 - ${hour}:59`}>
                  {groupedTimeSlots[hour].map((time) => (
                    <option 
                      key={time} 
                      value={time}
                      disabled={isTimeSlotDisabled(time) || (selectedStartTime ? time <= selectedStartTime : false)}
                    >
                      {format(parse(time, 'HH:mm', new Date()), 'h:mm a')}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-900/30 p-3 rounded-md border">
        <Switch
          id="recurring"
          checked={isRecurring}
          onCheckedChange={onRecurringChange}
          className="data-[state=checked]:bg-primary"
        />
        <Label htmlFor="recurring" className="text-sm font-medium cursor-pointer">
          {selectedDateRange && selectedDateRange.from && selectedDateRange.to ? 
            "Make this a weekly recurring availability for all selected dates" :
            "Make this a weekly recurring availability"
          }
        </Label>
      </div>

      {selectedDateRange && selectedDateRange.from && (
        <Alert className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 rounded-md">
          <div className="flex items-start">
            <Calendar className="h-4 w-4 mt-0.5 mr-2 text-amber-700 dark:text-amber-400" />
            <AlertDescription className="text-amber-700 dark:text-amber-400">
              <span className="font-medium">Date Range:</span>
              <span className="ml-1">{getDateRangeText()}</span>
            </AlertDescription>
          </div>
        </Alert>
      )}

      <Alert className="bg-gray-50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-800">
        <div className="flex items-start">
          <Info className="h-4 w-4 mt-0.5 mr-2 text-muted-foreground" />
          <AlertDescription className="text-muted-foreground text-sm">
            Times shown in your timezone ({userTimezone})
          </AlertDescription>
        </div>
      </Alert>
    </div>
  );
}
