import { useState } from "react";
import { CalendarContainer } from "./calendar/CalendarContainer";
import { EventsSidebar } from "./calendar/EventsSidebar";
import { useSessionEvents } from "@/hooks/useSessionEvents";
import { useAuthSession } from "@/hooks/useAuthSession";
import type { Profile } from "@/types/database/profiles";

interface CalendarTabProps {
  profile: Profile;
}

export function CalendarTab({ profile }: CalendarTabProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { data: events = [], refetch } = useSessionEvents();
  const { session } = useAuthSession();
  const isMentor = profile.id === session?.user.id && profile.user_type === 'mentor';

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <CalendarContainer
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          availability={[]}
        />
        <EventsSidebar
          date={selectedDate}
          events={events}
          isMentor={isMentor}
          onEventDelete={() => refetch()}
        />
      </div>
    </div>
  );
}