import { CalendarContainer } from "./calendar/CalendarContainer";
import type { Profile } from "@/types/database/profiles";
import { useState } from "react";
import { EventsSidebar } from "./calendar/EventsSidebar";
import { AvailabilitySection } from "./calendar/AvailabilitySection";

interface CalendarTabProps {
  profile: Profile;
}

export function CalendarTab({ profile }: CalendarTabProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const isMentor = profile.user_type === 'mentor';

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="w-fit">
          <CalendarContainer 
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            availability={[]}
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