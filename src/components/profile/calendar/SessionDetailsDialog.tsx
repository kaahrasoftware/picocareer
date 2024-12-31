import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertCircle, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { CalendarEvent } from "@/types/calendar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

  const handleAttendanceToggle = async (checked: boolean) => {
    try {
      const { error } = await supabase
        .from('mentor_sessions')
        .update({ attendance_confirmed: checked })
        .eq('id', session.session_details.id);

      if (error) throw error;

      setAttendance(checked);
      toast({
        title: checked ? "Attendance confirmed" : "Attendance unconfirmed",
        description: checked 
          ? "Thank you for confirming your attendance"
          : "Attendance status has been updated",
      });
    } catch (error) {
      console.error('Error updating attendance:', error);
      toast({
        title: "Error",
        description: "Failed to update attendance status",
        variant: "destructive",
      });
    }
  };

  const handleCancelSession = async () => {
    if (!canCancel || !session.session_details?.id) return;
    
    setIsCancelling(true);
    try {
      // First update the session status in the database
      const { error: dbError } = await supabase
        .from('mentor_sessions')
        .update({ 
          status: 'cancelled',
          notes: cancellationNote 
        })
        .eq('id', session.session_details.id);

      if (dbError) throw dbError;

      // If Google Meet was used, cancel the calendar event
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

      // Create notifications for both mentor and mentee
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

      // Send cancellation emails
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

  const handleJoinSession = () => {
    if (session.session_details?.meeting_link) {
      window.open(session.session_details.meeting_link, '_blank');
    } else {
      toast({
        title: "No meeting link available",
        description: "The meeting link for this session is not available",
        variant: "destructive",
      });
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

        <div className="space-y-6">
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

          {session.status === 'cancelled' ? (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">This session has been cancelled</span>
            </div>
          ) : (
            <div className="space-y-4">
              {canMarkAttendance && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <Label htmlFor="attendance" className="text-sm font-medium">
                    Confirm Attendance
                  </Label>
                  <Switch
                    id="attendance"
                    checked={attendance}
                    onCheckedChange={handleAttendanceToggle}
                  />
                </div>
              )}

              {session.session_details.meeting_link && (
                <Button
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={handleJoinSession}
                >
                  Join Session <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              )}

              {canCancel && (
                <>
                  <Textarea
                    placeholder="Please provide a reason for cancellation..."
                    value={cancellationNote}
                    onChange={(e) => onCancellationNoteChange(e.target.value)}
                    className="h-24 resize-none bg-muted"
                  />
                  
                  <DialogFooter>
                    <Button
                      variant="destructive"
                      onClick={handleCancelSession}
                      disabled={!cancellationNote.trim() || isCancelling}
                      className="w-full"
                    >
                      {isCancelling ? "Cancelling..." : "Cancel Session"}
                    </Button>
                  </DialogFooter>
                </>
              )}

              {!canCancel && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 text-yellow-500">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">
                    Sessions cannot be cancelled less than 1 hour before the start time
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}