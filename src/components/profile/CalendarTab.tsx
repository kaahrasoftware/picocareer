
import { useState } from "react";
import { CalendarView } from "./calendar/CalendarView";
import type { Profile } from "@/types/database/profiles";

interface CalendarTabProps {
  profile: Profile;
}

export function CalendarTab({ profile }: CalendarTabProps) {
  const isMentor = profile.user_type === 'mentor';

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Calendar</h2>
        <p className="text-muted-foreground">
          {isMentor ? 'Manage your availability and upcoming sessions' : 'View your scheduled sessions'}
        </p>
      </div>
      
      <CalendarView isMentor={isMentor} />
    </div>
  );
}
