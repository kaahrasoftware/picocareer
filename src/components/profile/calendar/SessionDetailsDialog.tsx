import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SessionInfo } from "./dialog/SessionInfo";
import { SessionActions } from "./dialog/SessionActions";
import { SessionFeedbackDialog } from "../feedback/SessionFeedbackDialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import type { CalendarEvent } from "@/types/calendar";
import { useState } from "react";

interface SessionDetailsDialogProps {
  session: CalendarEvent | null;
  open: boolean;
  onClose: () => void;
  userTimezone?: string;
}

export function SessionDetailsDialog({
  session,
  open,
  onClose,
  userTimezone,
}: SessionDetailsDialogProps) {
  if (!session) return null;

  const canCancel = session.session_details?.status === 'scheduled' && 
    new Date(session.session_details.scheduled_at) > new Date(Date.now() + 60 * 60 * 1000);
  
  const canMarkAttendance = session.session_details?.status === 'scheduled' && 
    new Date(session.session_details.scheduled_at) < new Date();

  const [attendance, setAttendance] = useState<boolean>(
    session.session_details?.attendance_confirmed || false
  );
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);

  return (
    <>
      <Dialog open={open} onOpenChange={() => onClose()}>
        <DialogContent className="max-h-[90vh] flex flex-col">
          <DialogHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <AspectRatio ratio={3/1} className="w-32">
                <img
                  src="/lovable-uploads/90701554-04cf-42e3-9cfd-cce94a7af17a.png"
                  alt="PicoCareer Logo"
                  className="object-contain"
                />
              </AspectRatio>
            </div>
            <DialogTitle>Session Details</DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4">
            <SessionInfo session={session} userTimezone={userTimezone || 'UTC'} />

            {session.session_details?.status === 'scheduled' && (
              <SessionActions
                session={session}
                canCancel={canCancel}
                canMarkAttendance={canMarkAttendance}
                attendance={attendance}
                setAttendance={setAttendance}
                isCancelling={false}
                onClose={onClose}
              />
            )}

            {session.session_details?.status === 'completed' && (
              <div className="mt-4 space-y-4">
                <Button 
                  onClick={() => setShowFeedbackDialog(true)}
                  className="w-full"
                >
                  Provide Feedback
                </Button>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {session.session_details && (
        <SessionFeedbackDialog
          sessionId={session.session_details.id}
          isOpen={showFeedbackDialog}
          onClose={() => setShowFeedbackDialog(false)}
          feedbackType="mentor_feedback"
          fromProfileId={session.session_details.mentor.id}
          toProfileId={session.session_details.mentee.id}
        />
      )}
    </>
  );
}