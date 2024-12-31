import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SessionInfo } from "./dialog/SessionInfo";
import { SessionActions } from "./dialog/SessionActions";
import { SessionFeedbackDialog } from "../feedback/SessionFeedbackDialog";
import type { CalendarEvent } from "@/types/calendar";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserSettings } from "@/hooks/useUserSettings";

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
  const { session: authSession } = useAuthSession();
  const [showFeedback, setShowFeedback] = useState(false);
  const [attendance, setAttendance] = useState(false);
  const { getSetting } = useUserSettings();
  const userTimezone = getSetting('timezone') || 'UTC';

  if (!session?.session_details) return null;

  const isMentor = authSession?.user?.id === session.session_details.mentor.id;
  const feedbackType = isMentor ? 'mentor_feedback' : 'mentee_feedback';
  
  // Calculate if session can be cancelled (more than 1 hour before start)
  const canCancel = session.session_details.status === 'scheduled' && 
    new Date(session.session_details.scheduled_at) > new Date(Date.now() + 60 * 60 * 1000);

  // Can mark attendance if session is scheduled and within 15 minutes of start time
  const sessionTime = new Date(session.session_details.scheduled_at);
  const canMarkAttendance = session.session_details.status === 'scheduled' && 
    Math.abs(sessionTime.getTime() - Date.now()) <= 15 * 60 * 1000;

  return (
    <>
      <Dialog open={!!session} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Session Details</DialogTitle>
          </DialogHeader>

          <SessionInfo session={session} userTimezone={userTimezone} />

          {session.session_details.status === 'scheduled' && (
            <>
              <Textarea
                placeholder="Reason for cancellation..."
                value={cancellationNote}
                onChange={(e) => onCancellationNoteChange(e.target.value)}
              />
              <SessionActions
                session={session}
                canCancel={canCancel}
                canMarkAttendance={canMarkAttendance}
                attendance={attendance}
                setAttendance={setAttendance}
                isCancelling={false}
                cancellationNote={cancellationNote}
                onCancellationNoteChange={onCancellationNoteChange}
                onCancel={onCancel}
                onClose={onClose}
              />
            </>
          )}

          {session.session_details.status === 'completed' && (
            <Button 
              onClick={() => setShowFeedback(true)}
              className="mt-4"
            >
              Provide Feedback
            </Button>
          )}
        </DialogContent>
      </Dialog>

      {showFeedback && (
        <SessionFeedbackDialog
          isOpen={showFeedback}
          onClose={() => setShowFeedback(false)}
          sessionId={session.session_details.id}
          feedbackType={feedbackType}
          fromProfileId={authSession?.user?.id || ''}
          toProfileId={isMentor ? session.session_details.mentee.id : session.session_details.mentor.id}
        />
      )}
    </>
  );
}