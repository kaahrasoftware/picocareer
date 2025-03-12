
import { useState, useEffect, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMentorTimezone } from "@/hooks/useMentorTimezone";
import { Skeleton } from "@/components/ui/skeleton";

interface DateSelectorProps {
  mentorId: string;
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
}

interface MentorAvailability {
  availabilities: {
    recurring: boolean;
    day_of_week: number;
    start_date_time: string;
    is_available: boolean;
  }[];
}

export function DateSelector({ mentorId, selectedDate, onDateSelect }: DateSelectorProps) {
  const { data: mentorTimezone, isLoading: isLoadingTimezone } = useMentorTimezone(mentorId);
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, boolean>>({});
  const [unavailabilityMap, setUnavailabilityMap] = useState<Record<string, boolean>>({});

  // Fetch mentor availability data with proper loading and error handling
  const { data: mentorAvailability, isLoading: isLoadingAvailability, error } = useQuery({
    queryKey: ['mentor-availability', mentorId],
    queryFn: async () => {
      try {
        console.log('Fetching availability data for mentor:', mentorId);
        const { data, error } = await supabase
          .from('mentor_availability')
          .select('*')
          .eq('profile_id', mentorId);

        if (error) {
          console.error('Error fetching mentor availability:', error);
          throw error;
        }

        return { availabilities: data || [] };
      } catch (error) {
        console.error('Error in availability query:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });

  // Build availability lookups
  useEffect(() => {
    if (!mentorAvailability?.availabilities) return;
    
    console.log('Processing availability data:', mentorAvailability.availabilities.length, 'records');
    
    const availableMap: Record<string, boolean> = {};
    const unavailableMap: Record<string, boolean> = {};
    
    // Pre-calculate dates for the next 90 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dates = [];
    for (let i = 0; i < 90; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    
    // Process availability for each date
    dates.forEach(date => {
      const dateKey = date.toISOString().split('T')[0];
      const dayOfWeek = date.getDay();
      
      // Check recurring availability
      const hasRecurringSlot = mentorAvailability.availabilities.some(availability => 
        availability.recurring === true && 
        availability.day_of_week === dayOfWeek &&
        availability.is_available === true
      );
      
      // Check specific date availability
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      const hasSpecificSlot = mentorAvailability.availabilities.some(availability => {
        if (!availability.start_date_time) return false;
        const availabilityStart = new Date(availability.start_date_time);
        return availabilityStart >= startOfDay && 
               availabilityStart <= endOfDay && 
               availability.is_available === true;
      });
      
      if (hasRecurringSlot || hasSpecificSlot) {
        availableMap[dateKey] = true;
      }
      
      // Check recurring unavailability
      const hasRecurringUnavailable = mentorAvailability.availabilities.some(availability => 
        availability.recurring === true && 
        availability.day_of_week === dayOfWeek &&
        availability.is_available === false
      );
      
      // Check specific date unavailability
      const hasSpecificUnavailable = mentorAvailability.availabilities.some(availability => {
        if (!availability.start_date_time) return false;
        const availabilityStart = new Date(availability.start_date_time);
        return availabilityStart >= startOfDay && 
               availabilityStart <= endOfDay && 
               availability.is_available === false;
      });
      
      if (hasRecurringUnavailable || hasSpecificUnavailable) {
        unavailableMap[dateKey] = true;
      }
    });
    
    setAvailabilityMap(availableMap);
    setUnavailabilityMap(unavailableMap);
    
    console.log('Availability maps created:', 
      Object.keys(availableMap).length, 'available dates,',
      Object.keys(unavailableMap).length, 'unavailable dates');
  }, [mentorAvailability]);

  // Memoize the calendar modifiers to avoid recalculations
  const calendarModifiers = useMemo(() => ({
    available: (date: Date) => {
      const dateKey = date.toISOString().split('T')[0];
      return availabilityMap[dateKey] === true;
    },
    unavailable: (date: Date) => {
      const dateKey = date.toISOString().split('T')[0];
      return unavailabilityMap[dateKey] === true;
    }
  }), [availabilityMap, unavailabilityMap]);

  const calendarModifiersStyles = {
    available: {
      border: '2px solid #22c55e',
      borderRadius: '4px'
    },
    unavailable: {
      border: '2px solid #ef4444',
      borderRadius: '4px',
      backgroundColor: 'rgba(239, 68, 68, 0.1)'
    }
  };

  // Calculate available dates for the empty state message
  const availableDates = mentorAvailability?.availabilities.filter(a => a.is_available) || [];

  if (isLoadingAvailability) {
    return (
      <div className="space-y-3 sm:space-y-4">
        <Skeleton className="h-[320px] w-full rounded-md" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 text-red-500 bg-red-50 rounded-md">
        <p>Error loading availability data. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={onDateSelect}
        className="rounded-md border w-full max-w-full mx-auto [&_.rdp-cell]:w-8 [&_.rdp-head_th]:w-8 [&_.rdp-button]:w-8 [&_.rdp-button]:h-8 [&_.rdp-head_th]:text-xs [&_.rdp-button]:text-xs sm:[&_.rdp-cell]:w-9 sm:[&_.rdp-head_th]:w-9 sm:[&_.rdp-button]:w-9 sm:[&_.rdp-button]:h-9 sm:[&_.rdp-head_th]:text-xs sm:[&_.rdp-button]:text-sm"
        disabled={(date) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          // Only enable dates that are today or in the future AND have availability information
          const dateKey = date.toISOString().split('T')[0];
          const hasAvailabilityInfo = availabilityMap[dateKey] || unavailabilityMap[dateKey];
          
          return date < today || !hasAvailabilityInfo;
        }}
        modifiers={calendarModifiers}
        modifiersStyles={calendarModifiersStyles}
      />

      <div className="mt-2 sm:mt-4 space-y-1 sm:space-y-2 text-[10px] xs:text-xs sm:text-sm text-gray-400">
        <p>Mentor's timezone: {isLoadingTimezone ? 'Loading...' : mentorTimezone}</p>
        <div className="flex flex-col xs:flex-row xs:gap-2">
          <p className="text-green-500">⬤ Available for booking</p>
          <p className="text-red-500">⬤ Unavailable</p>
        </div>
        {availableDates.length === 0 && (
          <p className="text-yellow-500">This mentor has no available dates</p>
        )}
      </div>
    </div>
  );
}
