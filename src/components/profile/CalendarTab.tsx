import { CalendarContainer } from "./calendar/CalendarContainer";
import type { Profile } from "@/types/database/profiles";

interface CalendarTabProps {
  profile: Profile;
}

export function CalendarTab({ profile }: CalendarTabProps) {
  return (
    <div className="space-y-4">
      <CalendarContainer profile={profile} />
    </div>
  );
}