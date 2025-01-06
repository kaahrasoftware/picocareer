import { Dialog, DialogContent } from "@/components/ui/dialog";
import { SessionActions } from "./dialog/SessionActions";
import { SessionInfo } from "./dialog/SessionInfo";
import { SessionFeedbackDialog } from "@/components/profile/feedback/SessionFeedbackDialog";
import { useState } from "react";
import { CalendarEvent } from "@/types/calendar";
import { useUserSettings } from "@/hooks/useUserSettings";

interface SessionDetailsDialogProps {
  session: CalendarEvent;
  onClose: () => void;
  onCancel: () => Promise<void>;
}

export function SessionDetailsDialog({ session, onClose, onCancel }: SessionDetailsDialogProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [attendance, setAttendance] = useState(session.session_details?.attendance_confirmed || false);
  const [isCancelling, setIsCancelling] = useState(false);
  const { getSetting } = useUserSettings();
  const userTimezone = getSetting("timezone");

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await onCancel();
    } finally {
      setIsCancelling(false);
      onClose();
    }
  };

  const canCancel = !session.session_details?.status?.includes('cancelled') && 
    new Date(session.start_time) > new Date(Date.now() + 60 * 60 * 1000);

  const canMarkAttendance = new Date(session.end_time) < new Date() && 
    !session.session_details?.status?.includes('cancelled');

  return (
    <>
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-lg">
          <SessionInfo session={session} userTimezone={userTimezone} />
          <SessionActions
            session={session}
            canCancel={canCancel}
            canMarkAttendance={canMarkAttendance}
            attendance={attendance}
            setAttendance={setAttendance}
            isCancelling={isCancelling}
            onCancel={handleCancel}
            onClose={onClose}
          />
        </DialogContent>
      </Dialog>

      {showFeedback && (
        <SessionFeedbackDialog
          isOpen={showFeedback}
          sessionId={session.session_details?.id || ""}
          feedbackType={session.session_details?.mentor_id ? "mentee_feedback" : "mentor_feedback"}
          fromProfileId={session.session_details?.mentor_id || ""}
          toProfileId={session.session_details?.mentee_id || ""}
          onClose={() => setShowFeedback(false)}
        />
      )}
    </>
  );
}