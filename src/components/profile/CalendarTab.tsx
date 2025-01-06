import { CalendarContainer } from "./calendar/CalendarContainer";
import type { Profile } from "@/types/database/profiles";
import { useState } from "react";
import { EventsSidebar } from "./calendar/EventsSidebar";
import { AvailabilitySection } from "./calendar/AvailabilitySection";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Availability } from "@/types/calendar";

interface CalendarTabProps {
  profile: Profile;
}

export function CalendarTab({ profile }: CalendarTabProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const isMentor = profile.user_type === 'mentor';

  const { data: availability = [] } = useQuery<Availability[]>({
    queryKey: ['mentor-availability', profile.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentor_availability')
        .select('*')
        .eq('profile_id', profile.id);

      if (error) throw error;
      return data;
    },
    enabled: !!profile.id,
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="w-fit">
          <CalendarContainer 
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            availability={availability}
          />
          {isMentor && selectedDate && (
            <AvailabilitySection 
              selectedDate={selectedDate}
              onAvailabilityChange={() => {}}
            />
          )}
        </div>

        {selectedDate && (
          <EventsSidebar
            date={selectedDate}
            events={[]}
            isMentor={isMentor}
            timezone={Intl.DateTimeFormat().resolvedOptions().timeZone}
          />
        )}
      </div>
    </div>
  );
}