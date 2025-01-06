import { useState } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SessionActions } from "./dialog/SessionActions";
import { SessionInfo } from "./dialog/SessionInfo";
import { SessionFeedbackDialog } from "@/components/profile/feedback/SessionFeedbackDialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { CalendarEvent } from "@/types/calendar";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useUserSettings } from "@/hooks/useUserSettings";

interface SessionDetailsDialogProps {
  session: CalendarEvent | null;
  onClose: () => void;
}

export function SessionDetailsDialog({ session, onClose }: SessionDetailsDialogProps) {
  const [attendance, setAttendance] = useState(session?.session_details?.attendance_confirmed || false);
  const [isCancelling, setIsCancelling] = useState(false);
  const { toast } = useToast();
  const { data: userSettings } = useUserSettings();
  const userTimezone = userSettings?.find(s => s.setting_type === 'timezone')?.setting_value || 'UTC';

  const canCancel = session?.session_details && 
    new Date(session.session_details.scheduled_at) > new Date(Date.now() + 60 * 60 * 1000);
  
  const canMarkAttendance = session?.status === 'completed';

  const handleCancel = async () => {
    if (!session?.session_details) return;

    try {
      setIsCancelling(true);

      // Update the session status in the database
      const { error: sessionError } = await supabase
        .from('mentor_sessions')
        .update({ 
          status: 'cancelled'
        })
        .eq('id', session.session_details.id);

      if (sessionError) throw sessionError;

      // Create notifications for both mentor and mentee
      const notifications = [
        {
          profile_id: session.session_details.mentor.id,
          title: 'Session Cancelled',
          message: `Session with ${session.session_details.mentee.full_name} has been cancelled.`,
          type: 'session_cancelled' as const
        },
        {
          profile_id: session.session_details.mentee.id,
          title: 'Session Cancelled',
          message: `Session with ${session.session_details.mentor.full_name} has been cancelled.`,
          type: 'session_cancelled' as const
        }
      ];

      // Insert notifications
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (notificationError) throw notificationError;

      // Send cancellation emails
      const { error: emailError } = await supabase.functions.invoke('send-session-email', {
        body: { 
          sessionId: session.session_details.id,
          type: 'cancellation'
        }
      });

      if (emailError) {
        console.error('Error sending cancellation emails:', emailError);
      }

      toast({
        title: "Session cancelled",
        description: "The session has been cancelled and notifications have been sent.",
      });

      onClose();
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

  if (!session) return null;

  return (
    <>
      <Dialog open={!!session} onOpenChange={() => onClose()}>
        <DialogContent className="sm:max-w-[425px] max-h-[80vh]">
          <DialogHeader>
            <AspectRatio ratio={16 / 9} className="bg-muted mb-2">
              <img
                src="/lovable-uploads/2f911e17-c410-44bf-bd05-1243e9536612.png"
                alt="PicoCareer Logo"
                className="mx-auto h-12 object-contain"
              />
            </AspectRatio>
            <DialogTitle>Session Details</DialogTitle>
          </DialogHeader>

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

      {session.session_details?.id && (
        <SessionFeedbackDialog
          sessionId={session.session_details.id}
          onClose={onClose}
        />
      )}
    </>
  );
}