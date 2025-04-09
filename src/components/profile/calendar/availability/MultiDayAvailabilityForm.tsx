
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TimeSlotInputs } from "./TimeSlotInputs";
import { useUserSettings } from "@/hooks/useUserSettings";
import { format, addDays, getDay } from "date-fns";
import { getTimezoneOffset } from "@/utils/timezoneUpdater";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface MultiDayAvailabilityFormProps {
  selectedDate: Date;
  selectedDateRange: DateRange | undefined;
  profileId: string;
  onSuccess: () => void;
  onDateRangeChange: (range: DateRange | undefined) => void;
}

export function MultiDayAvailabilityForm({
  selectedDate,
  selectedDateRange,
  profileId,
  onSuccess,
  onDateRangeChange,
}: MultiDayAvailabilityFormProps) {
  const [selectedStartTime, setSelectedStartTime] = useState<string>();
  const [selectedEndTime, setSelectedEndTime] = useState<string>();
  const [isRecurring, setIsRecurring] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { getSetting } = useUserSettings(profileId);
  const userTimezone = getSetting('timezone');
  
  // Calculate number of days in the selected range
  const daysCount = selectedDateRange?.from && selectedDateRange?.to
    ? Math.round((selectedDateRange.to.getTime() - selectedDateRange.from.getTime()) / (1000 * 60 * 60 * 24)) + 1
    : 0;

  const handleSaveAvailability = async () => {
    if (!selectedDateRange?.from || !selectedEndTime || !selectedStartTime) {
      toast({
        title: "Missing information",
        description: "Please select both date range and time slots",
        variant: "destructive",
      });
      return;
    }

    if (!userTimezone) {
      toast({
        title: "Timezone not set",
        description: "Please set your timezone in settings before setting availability",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const availabilitySlots = [];
      let currentDate = new Date(selectedDateRange.from);
      const endDate = selectedDateRange.to || selectedDateRange.from;
      
      // Loop through each day in the date range
      while (currentDate <= endDate) {
        const dayOfWeek = getDay(currentDate);
        
        // Create slot for each day
        const startDateTime = new Date(currentDate);
        const [startHours, startMinutes] = selectedStartTime.split(':').map(Number);
        startDateTime.setHours(startHours, startMinutes, 0, 0);

        const endDateTime = new Date(currentDate);
        const [endHours, endMinutes] = selectedEndTime.split(':').map(Number);
        endDateTime.setHours(endHours, endMinutes, 0, 0);
        
        // Calculate timezone offset
        const timezoneOffsetMinutes = getTimezoneOffset(startDateTime, userTimezone);
        
        availabilitySlots.push({
          profile_id: profileId,
          start_date_time: startDateTime.toISOString(),
          end_date_time: endDateTime.toISOString(),
          is_available: true,
          recurring: isRecurring,
          day_of_week: isRecurring ? dayOfWeek : null,
          timezone_offset: timezoneOffsetMinutes,
          reference_timezone: userTimezone,
          dst_aware: true,
          last_dst_check: new Date().toISOString()
        });
        
        // Move to next day
        currentDate = addDays(currentDate, 1);
      }
      
      // Batch insert all availability slots
      const { error } = await supabase
        .from('mentor_availability')
        .insert(availabilitySlots);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Availability set for ${daysCount} day${daysCount > 1 ? 's' : ''}`,
      });
      
      // Reset form
      setSelectedStartTime(undefined);
      setSelectedEndTime(undefined);
      setIsRecurring(false);
      onDateRangeChange(undefined);
      onSuccess();
      
    } catch (error: any) {
      console.error('Error setting availability:', error);
      toast({
        title: "Error",
        description: "Failed to set availability: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
      <div className="mb-4">
        <div className="flex flex-col">
          <h4 className="font-medium mb-2">Select Date Range</h4>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !selectedDateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDateRange?.from ? (
                  selectedDateRange.to ? (
                    <>
                      {format(selectedDateRange.from, "LLL dd, y")} -{" "}
                      {format(selectedDateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(selectedDateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Select date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={selectedDate}
                selected={selectedDateRange}
                onSelect={onDateRangeChange}
                numberOfMonths={2}
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return date < today;
                }}
              />
            </PopoverContent>
          </Popover>
          {selectedDateRange?.from && selectedDateRange?.to && (
            <p className="text-sm text-muted-foreground mt-2">
              {daysCount} day{daysCount !== 1 ? 's' : ''} selected
            </p>
          )}
        </div>
      </div>

      <TimeSlotInputs
        timeSlots={timeSlots}
        selectedStartTime={selectedStartTime}
        selectedEndTime={selectedEndTime}
        isRecurring={isRecurring}
        userTimezone={userTimezone || 'Not set'}
        selectedDate={selectedDate}
        onStartTimeSelect={setSelectedStartTime}
        onEndTimeSelect={setSelectedEndTime}
        onRecurringChange={setIsRecurring}
      />

      {!selectedDateRange?.from && (
        <Alert className="bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-900/50">
          <AlertCircle className="h-4 w-4 text-yellow-800 dark:text-yellow-300" />
          <AlertDescription>
            Please select a date range to set availability for multiple days
          </AlertDescription>
        </Alert>
      )}

      <Button 
        onClick={handleSaveAvailability}
        disabled={!selectedStartTime || !selectedEndTime || isSubmitting || !userTimezone || !selectedDateRange?.from}
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          `Save Availability${daysCount > 0 ? ` for ${daysCount} Day${daysCount > 1 ? 's' : ''}` : ''}`
        )}
      </Button>
    </div>
  );
}
