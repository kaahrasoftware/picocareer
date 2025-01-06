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
import Image from "@/components/ui/image";
import type { Session } from "@/types/session";
import { useState } from "react";

interface SessionDetailsDialogProps {
  session: Session | null;
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

  const canCancel = session.session_details.status === 'scheduled' && 
    new Date(session.session_details.scheduled_at) > new Date(Date.now() + 60 * 60 * 1000);
  
  const canMarkAttendance = session.session_details.status === 'scheduled' && 
    new Date(session.session_details.scheduled_at) < new Date();

  const [attendance, setAttendance] = useState<boolean>(
    session.session_details.attendance_confirmed || false
  );
  const [cancellationNote, onCancellationNoteChange] = useState<string>('');
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);

  const handleCancel = async () => {
    // Handle cancellation logic here
  };

  return (
    <>
      <Dialog open={open} onOpenChange={() => onClose()}>
        <DialogContent className="max-h-[90vh] flex flex-col">
          <DialogHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <AspectRatio ratio={3/1} className="w-32">
                <Image
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

            {session.session_details.status === 'scheduled' && (
              <SessionActions
                session={session}
                canCancel={canCancel}
                canMarkAttendance={canMarkAttendance}
                attendance={attendance}
                setAttendance={setAttendance}
                isCancelling={false}
                cancellationNote={cancellationNote}
                onCancellationNoteChange={onCancellationNoteChange}
                onCancel={handleCancel}
                onClose={onClose}
              />
            )}

            {session.session_details.status === 'completed' && (
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

      <SessionFeedbackDialog
        session={session}
        open={showFeedbackDialog}
        onClose={() => setShowFeedbackDialog(false)}
      />
    </>
  );
}
