import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CalendarEvent } from "@/types/calendar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SessionInfo } from "./dialog/SessionInfo";
import { SessionActions } from "./dialog/SessionActions";

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
  const { toast } = useToast();
  const [attendance, setAttendance] = React.useState(false);
  const [isCancelling, setIsCancelling] = React.useState(false);
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  if (!session?.session_details) return null;

  const sessionTime = new Date(session.start_time);
  const canCancel = sessionTime > new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
  const canMarkAttendance = sessionTime < new Date(); // Session is in the past

  const handleCancelSession = async () => {
    if (!canCancel || !session.session_details?.id) return;
    
    setIsCancelling(true);
    try {
      const { error: dbError } = await supabase
        .from('mentor_sessions')
        .update({ 
          status: 'cancelled',
          notes: cancellationNote 
        })
        .eq('id', session.session_details.id);

      if (dbError) throw dbError;

      if (session.session_details.meeting_platform === 'google_meet') {
        const { error: meetError } = await supabase.functions.invoke('cancel-meet-link', {
          body: { sessionId: session.session_details.id }
        });

        if (meetError) {
          console.error('Error cancelling meet link:', meetError);
          toast({
            title: "Google Meet Error",
            description: "Session cancelled, but there was an issue cancelling the Google Meet link.",
            variant: "destructive"
          });
        }
      }

      const notifications = [
        {
          profile_id: session.session_details.mentor.id,
          title: 'Session Cancelled',
          message: `Session with ${session.session_details.mentee.full_name} has been cancelled. Note: ${cancellationNote}`,
          type: 'session_cancelled' as const
        },
        {
          profile_id: session.session_details.mentee.id,
          title: 'Session Cancelled',
          message: `Session with ${session.session_details.mentor.full_name} has been cancelled. Note: ${cancellationNote}`,
          type: 'session_cancelled' as const
        }
      ];

      const { error: notificationError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (notificationError) throw notificationError;

      await supabase.functions.invoke('send-session-email', {
        body: { 
          sessionId: session.session_details.id,
          type: 'cancellation'
        }
      });

      await onCancel();
      onClose();
      
      toast({
        title: "Session Cancelled",
        description: "The session has been cancelled and notifications have been sent.",
      });
    } catch (error) {
      console.error('Error cancelling session:', error);
      toast({
        title: "Error",
        description: "Failed to cancel the session. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <Dialog open={!!session} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Session Details</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            View session details and manage your booking
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
          <SessionInfo session={session} userTimezone={userTimezone} />
          <SessionActions
            session={session}
            canCancel={canCancel}
            canMarkAttendance={canMarkAttendance}
            attendance={attendance}
            setAttendance={setAttendance}
            isCancelling={isCancelling}
            cancellationNote={cancellationNote}
            onCancellationNoteChange={onCancellationNoteChange}
            onCancel={handleCancelSession}
            onClose={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}