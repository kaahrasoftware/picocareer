import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CalendarEvent } from "@/types/calendar";
import { SessionInfo } from "./session-details/SessionInfo";
import { SessionActions } from "./session-details/SessionActions";

interface SessionDetailsDialogProps {
  session: CalendarEvent | null;
  onClose: () => void;
  onCancel: () => Promise<void>;
  cancellationNote: string;
  onCancellationNoteChange: (note: string) => void;
}

export function SessionDetailsDialog({
  session,
  onClose,
  onCancel,
  cancellationNote,
  onCancellationNoteChange,
}: SessionDetailsDialogProps) {
  const [attendance, setAttendance] = useState(false);
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  if (!session?.session_details) return null;

  return (
    <Dialog open={!!session} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-background border-border max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Session Details</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            View session details and manage your booking
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <SessionInfo session={session} userTimezone={userTimezone} />
          <SessionActions
            session={session}
            attendance={attendance}
            setAttendance={setAttendance}
            cancellationNote={cancellationNote}
            onCancellationNoteChange={onCancellationNoteChange}
            onCancel={onCancel}
            onClose={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}