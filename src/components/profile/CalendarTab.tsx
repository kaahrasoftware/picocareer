
import { useState } from "react";
import { CalendarContainer } from "./calendar/CalendarContainer";
import { useSessionEvents } from "@/hooks/useSessionEvents";
import { useAuthSession } from "@/hooks/useAuthSession";
import type { Profile } from "@/types/database/profiles";

interface CalendarTabProps {
  profile: Profile;
}

export function CalendarTab({ profile }: CalendarTabProps) {
  const { data: events = [], refetch } = useSessionEvents();
  const { session } = useAuthSession();
  const isMentor = profile.id === session?.user.id && profile.user_type === 'mentor';

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-4">
        <CalendarContainer
          isMentor={isMentor}
          profileId={profile.id}
        />
      </div>
    </div>
  );
}
