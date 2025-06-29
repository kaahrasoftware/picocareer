
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { CalendarContainer } from "./calendar/CalendarContainer";
import { EventsSidebar } from "./calendar/EventsSidebar";
import { useSessionEvents } from "@/hooks/useSessionEvents";
import { useAuthSession } from "@/hooks/useAuthSession";
import type { Profile } from "@/types/database/profiles";

interface CalendarTabProps {
  profile: Profile;
}

export function CalendarTab({ profile }: CalendarTabProps) {
  const [searchParams] = useSearchParams();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { data: events = [], refetch } = useSessionEvents();
  const { session } = useAuthSession();
  const isMentor = profile.id === session?.user.id && profile.user_type === 'mentor';

  // Handle date parameter from URL
  useEffect(() => {
    const dateParam = searchParams.get('date');
    if (dateParam) {
      // Parse date in YYYY-MM-DD format
      const parsedDate = new Date(dateParam + 'T00:00:00');
      
      // Validate the date
      if (!isNaN(parsedDate.getTime())) {
        setSelectedDate(parsedDate);
      }
    }
  }, [searchParams]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="w-full lg:w-auto">
          <CalendarContainer
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            availability={[]}
            events={events}
          />
        </div>
        <div className="w-full lg:w-auto">
          <EventsSidebar
            date={selectedDate}
            events={events}
            isMentor={isMentor}
            onEventDelete={() => refetch()}
          />
        </div>
      </div>
    </div>
  );
}
