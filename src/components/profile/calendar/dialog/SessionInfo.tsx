import React from "react";
import { formatInTimeZone } from "date-fns-tz";
import { CalendarEvent } from "@/types/calendar";

interface SessionInfoProps {
  session: CalendarEvent;
  userTimezone: string;
}

export function SessionInfo({ session, userTimezone }: SessionInfoProps) {
  if (!session?.session_details) return null;

  return (
    <div className="space-y-4 divide-y divide-border/30">
      <div className="pb-4">
        <h4 className="text-sm font-medium text-foreground mb-1">Session Type</h4>
        <p className="text-sm text-muted-foreground">
          {session.session_details.session_type.type}
        </p>
      </div>

      <div className="py-4">
        <h4 className="text-sm font-medium text-foreground mb-1">Time</h4>
        <p className="text-sm text-muted-foreground">
          {formatInTimeZone(
            new Date(session.start_time),
            userTimezone,
            "PPP p"
          )}
        </p>
      </div>

      <div className="py-4">
        <h4 className="text-sm font-medium text-foreground mb-1">Duration</h4>
        <p className="text-sm text-muted-foreground">
          {session.session_details.session_type.duration} minutes
        </p>
      </div>

      <div className="py-4">
        <h4 className="text-sm font-medium text-foreground mb-1">Participants</h4>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Mentor:</span> {session.session_details.mentor.full_name}
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Mentee:</span> {session.session_details.mentee.full_name}
          </p>
        </div>
      </div>
    </div>
  );
}