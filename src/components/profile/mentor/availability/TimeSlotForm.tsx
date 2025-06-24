import { useState, useEffect, useMemo } from "react";
import { format, addMinutes, isWithinInterval } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserSettings } from "@/hooks/useUserSettings";
import { supabase } from "@/integrations/supabase/client";
import { TimePicker } from "@/components/ui/time-picker";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface TimeSlotInputsProps {
  timeSlots: any[];
  date: Date;
  selectedStartTime: string;
  selectedEndTime: string;
  isRecurring: boolean;
  userTimezone: string;
  onStartTimeSelect: (time: string) => void;
  onEndTimeSelect: (time: string) => void;
  onRecurringChange: () => void;
}

export function TimeSlotForm() {
  const { toast } = useToast();
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);
  const { getSetting } = useUserSettings(profile?.id || '');
  const userTimezone = getSetting('timezone') || Intl.DateTimeFormat().resolvedOptions().timeZone;

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedStartTime, setSelectedStartTime] = useState("09:00");
  const [selectedEndTime, setSelectedEndTime] = useState("17:00");
  const [isRecurring, setIsRecurring] = useState(false);

  const timeSlots = useMemo(() => {
    const slots = [];
    let currentTime = new Date(selectedDate);
    currentTime.setHours(9, 0, 0, 0); // Start at 9:00 AM

    const endTime = new Date(selectedDate);
    endTime.setHours(17, 0, 0, 0); // End at 5:00 PM

    while (currentTime < endTime) {
      const time = format(currentTime, 'HH:mm');
      slots.push(time);
      currentTime = addMinutes(currentTime, 30);
    }
    return slots;
  }, [selectedDate]);

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Select Date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              {selectedDate ? (
                format(selectedDate, "PPP")
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center" side="bottom">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) =>
                date < new Date()
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <TimeSlotInputs
        timeSlots={timeSlots}
        date={selectedDate}
        selectedStartTime={selectedStartTime}
        selectedEndTime={selectedEndTime}
        isRecurring={isRecurring}
        userTimezone={userTimezone}
        onStartTimeSelect={setSelectedStartTime}
        onEndTimeSelect={setSelectedEndTime}
        onRecurringChange={() => setIsRecurring(!isRecurring)}
      />
    </div>
  );
}
