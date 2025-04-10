
import { RescheduleDialog } from "./dialog/RescheduleDialog";
import { CancelDialog } from "./dialog/CancelDialog";
import { SendReminderDialog } from "./dialog/SendReminderDialog";
import { SessionFeedbackDialog } from "../feedback/SessionFeedbackDialog";
import type { CalendarEvent } from "@/types/calendar";

interface EventDialogsProps {
  selectedEvent: CalendarEvent | null;
  showReschedule: boolean;
  showCancel: boolean;
  showReminder: boolean;
  showFeedback: boolean;
  userId: string | undefined;
  isMentor: boolean;
  onClose: () => void;
}

export function EventDialogs({
  selectedEvent,
  showReschedule,
  showCancel,
  showReminder,
  showFeedback,
  userId,
  isMentor,
  onClose
}: EventDialogsProps) {
  if (!selectedEvent) return null;

  return (
    <>
      {showReschedule && (
        <RescheduleDialog
          isOpen={showReschedule}
          onClose={onClose}
          sessionId={selectedEvent.id}
          currentScheduledTime={new Date(selectedEvent.start_time)}
          duration={selectedEvent.session_details?.session_type.duration || 60}
          mentorId={selectedEvent.session_details?.mentor.id || ''}
        />
      )}

      {showCancel && (
        <CancelDialog
          isOpen={showCancel}
          onClose={onClose}
          sessionId={selectedEvent.id}
          onCancelled={onClose}
        />
      )}

      {showReminder && userId && (
        <SendReminderDialog
          isOpen={showReminder}
          onClose={onClose}
          sessionId={selectedEvent.id}
          senderId={userId}
        />
      )}

      {showFeedback && userId && selectedEvent.session_details && (
        <SessionFeedbackDialog
          isOpen={showFeedback}
          onClose={onClose}
          sessionId={selectedEvent.id}
          feedbackType={isMentor ? 'mentor_feedback' : 'mentee_feedback'}
          fromProfileId={userId}
          toProfileId={isMentor 
            ? selectedEvent.session_details.mentee.id 
            : selectedEvent.session_details.mentor.id}
        />
      )}
    </>
  );
}
