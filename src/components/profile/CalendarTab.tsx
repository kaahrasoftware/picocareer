import { CalendarContainer } from "./calendar/CalendarContainer";
import type { Profile } from "@/types/database/profiles";
import { AvailabilitySection } from "./calendar/AvailabilitySection";

interface CalendarTabProps {
  profile: Profile;
}

export function CalendarTab({ profile }: CalendarTabProps) {
  const isMentor = profile?.user_type === 'mentor';

  return (
    <div className="space-y-4">
      <CalendarContainer profile={profile} />
      {isMentor && (
        <AvailabilitySection 
          selectedDate={new Date()} 
          onAvailabilityChange={() => {}}
        />
      )}
    </div>
  );
}