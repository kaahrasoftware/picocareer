import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Profile } from "@/types/database/profiles";
import { EventsSidebar } from "./EventsSidebar";
import { useSessionEvents } from "@/hooks/useSessionEvents";
import { EventList } from "./EventList";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CalendarContainerProps {
  profile: Profile;
}

export function CalendarContainer({ profile }: CalendarContainerProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { data: events = [] } = useSessionEvents();
  const isMentor = profile?.user_type === 'mentor';

  // Fetch availability data
  const { data: availabilityData } = useQuery({
    queryKey: ['mentor-availability', profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentor_availability')
        .select('*')
        .eq('profile_id', profile?.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.id,
  });

  // Function to determine if a date has availability set
  const getDateStatus = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    let hasAvailable = false;
    let hasUnavailable = false;

    availabilityData?.forEach(slot => {
      if (slot.recurring) {
        if (slot.day_of_week === date.getDay()) {
          if (slot.is_available) {
            hasAvailable = true;
          } else {
            hasUnavailable = true;
          }
        }
      } else {
        if (format(new Date(slot.start_date_time), 'yyyy-MM-dd') === dateStr) {
          if (slot.is_available) {
            hasAvailable = true;
          } else {
            hasUnavailable = true;
          }
        }
      }
    });

    if (hasAvailable && hasUnavailable) return 'mixed';
    if (hasAvailable) return 'available';
    if (hasUnavailable) return 'unavailable';
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4">
      <div>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && setSelectedDate(date)}
          className="rounded-md border"
          modifiers={{
            available: (date) => getDateStatus(date) === 'available',
            unavailable: (date) => getDateStatus(date) === 'unavailable',
            mixed: (date) => getDateStatus(date) === 'mixed'
          }}
          modifiersStyles={{
            available: {
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              border: '2px solid #22c55e',
              borderRadius: '4px',
              color: '#22c55e'
            },
            unavailable: {
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '2px solid #ef4444',
              borderRadius: '4px',
              color: '#ef4444'
            },
            mixed: {
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              border: '2px solid #f59e0b',
              borderRadius: '4px',
              color: '#f59e0b'
            }
          }}
        />
        <div className="mt-4">
          <EventList 
            events={events.filter(event => 
              format(new Date(event.start_time), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
            )}
            isMentor={isMentor}
          />
        </div>
      </div>
      
      <EventsSidebar
        date={selectedDate}
        events={events}
        isMentor={isMentor}
      />
    </div>
  );
}