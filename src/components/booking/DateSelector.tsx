
import { Calendar } from "@/components/ui/calendar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMentorTimezone } from "@/hooks/useMentorTimezone";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";
import { format, addDays, isWithinInterval } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

interface DateSelectorProps {
  mentorId: string;
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
}

interface MentorAvailability {
  recurring: boolean;
  day_of_week: number;
  start_date_time: string;
  is_available: boolean;
}

export function DateSelector({ mentorId, selectedDate, onDateSelect }: DateSelectorProps) {
  const { data: mentorTimezone, isLoading: isLoadingTimezone } = useMentorTimezone(mentorId);
  
  // Fetch mentor availability data
  const { data: mentorAvailabilityData, isLoading: isLoadingAvailability, error } = useQuery({
    queryKey: ['mentor-availability', mentorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentor_availability')
        .select('*')
        .eq('profile_id', mentorId);

      if (error) {
        console.error('Error fetching mentor availability:', error);
        throw error;
      }

      // Store both available and unavailable slots
      return { availabilities: data || [] };
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Calculate next 60 days
  const nextTwoMonths = useMemo(() => {
    const today = new Date();
    const dates = [];
    for (let i = 0; i < 60; i++) {
      dates.push(addDays(today, i));
    }
    return dates;
  }, []);

  // Process availability data to determine available dates
  const availabilityMap = useMemo(() => {
    if (!mentorAvailabilityData) return new Map();
    
    const map = new Map();
    
    // First, mark all dates as unknown (undefined)
    nextTwoMonths.forEach(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      map.set(dateStr, undefined);
    });
    
    // Process recurring slots (mark days of week as available if there's a recurring slot)
    mentorAvailabilityData.availabilities
      .filter(slot => slot.recurring && slot.is_available)
      .forEach(slot => {
        nextTwoMonths.forEach(date => {
          if (date.getDay() === slot.day_of_week) {
            const dateStr = format(date, 'yyyy-MM-dd');
            map.set(dateStr, true);
          }
        });
      });
    
    // Process one-time slots (both available and unavailable)
    mentorAvailabilityData.availabilities
      .filter(slot => !slot.recurring)
      .forEach(slot => {
        const slotDate = new Date(slot.start_date_time);
        const dateStr = format(slotDate, 'yyyy-MM-dd');
        
        // One-time slots override recurring ones
        if (slot.is_available) {
          map.set(dateStr, true);
        } else {
          // For unavailable slots, we'll set to false to disable the date
          map.set(dateStr, false);
        }
      });
    
    return map;
  }, [mentorAvailabilityData, nextTwoMonths]);

  // Helper function to check if a specific date is available
  const isDateAvailable = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return availabilityMap.get(dateStr) === true;
  };

  // Calendar styles - only highlight available dates
  const calendarModifiers = {
    available: (date: Date) => isDateAvailable(date)
  };

  const calendarModifiersStyles = {
    available: {
      border: '2px solid #22c55e',
      borderRadius: '4px'
    }
  };

  const isLoading = isLoadingTimezone || isLoadingAvailability;

  if (isLoading) {
    return <Skeleton className="h-[350px] w-full max-w-[350px]" />;
  }

  if (error) {
    return (
      <div className="text-center text-destructive p-4 bg-destructive/10 rounded-md">
        Error loading mentor's availability. Please try again.
      </div>
    );
  }

  const availableDates = Array.from(availabilityMap.entries())
    .filter(([_, isAvailable]) => isAvailable === true)
    .map(([dateStr]) => dateStr);

  return (
    <div className="space-y-4">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={onDateSelect}
        className="rounded-md border w-full max-w-[350px] mx-auto sm:max-w-none [&_.rdp-cell]:w-9 [&_.rdp-head_th]:w-9 [&_.rdp-button]:w-9 [&_.rdp-button]:h-9 [&_.rdp-head_th]:text-xs sm:[&_.rdp-head_th]:text-sm [&_.rdp-button]:text-sm"
        disabled={(date) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          // Disable dates that are in the past or not explicitly marked as available
          return date < today || !isDateAvailable(date);
        }}
        modifiers={calendarModifiers}
        modifiersStyles={calendarModifiersStyles}
      />

      <div className="mt-4 space-y-2 text-xs sm:text-sm text-gray-400">
        <p>Mentor's timezone: {isLoadingTimezone ? 'Loading...' : mentorTimezone}</p>
        <p className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 bg-green-500/30 border border-green-500 rounded-sm"></span>
          Days highlighted in green are available for booking
        </p>
        {mentorTimezone && (
          <p>Current time in mentor's timezone: {formatInTimeZone(new Date(), mentorTimezone, 'h:mm a')}</p>
        )}
        {availableDates.length === 0 && (
          <p className="text-yellow-500">This mentor has no available dates</p>
        )}
      </div>
    </div>
  );
}
