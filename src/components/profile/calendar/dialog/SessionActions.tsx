import React from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, ExternalLink } from "lucide-react";
import { CalendarEvent } from "@/types/calendar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SessionActionsProps {
  session: CalendarEvent;
  canCancel: boolean;
  canMarkAttendance: boolean;
  attendance: boolean;
  setAttendance: (value: boolean) => void;
  isCancelling: boolean;
  cancellationNote: string;
  onCancellationNoteChange: (note: string) => void;
  onCancel: () => Promise<void>;
  onClose: () => void;
}

export function SessionActions({
  session,
  canCancel,
  canMarkAttendance,
  attendance,
  setAttendance,
  isCancelling,
  cancellationNote,
  onCancellationNoteChange,
  onCancel,
  onClose,
}: SessionActionsProps) {
  const { toast } = useToast();

  const handleAttendanceToggle = async (checked: boolean) => {
    try {
      const { error } = await supabase
        .from('mentor_sessions')
        .update({ attendance_confirmed: checked })
        .eq('id', session.session_details?.id);

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

  const handleCancelSession = async () => {
    if (!canCancel || !session.session_details?.id) return;
    
    try {
      // First try to cancel the Google Calendar event
      if (session.session_details.meeting_platform === 'google_meet') {
        const { error: meetError } = await supabase.functions.invoke('cancel-meet-link', {
          body: { sessionId: session.session_details.id }
        });

        if (meetError) {
          console.error('Error cancelling Google Calendar event:', meetError);
          toast({
            title: "Warning",
            description: "There was an issue cancelling the calendar event. The session will still be cancelled.",
            variant: "destructive"
          });
        }
      }

      // Then cancel the session in our database
      await onCancel();
      onClose();
      
      toast({
        title: "Session Cancelled",
        description: "The session has been cancelled and notifications have been sent.",
      });
    } catch (error) {
      console.error('Error in handleCancelSession:', error);
      toast({
        title: "Error",
        description: "Failed to cancel the session. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (session.status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
        <AlertCircle className="h-4 w-4" />
        <span className="text-sm font-medium">This session has been cancelled</span>
      </div>
    );
  }

  return (
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

      {session.session_details?.meeting_link && (
        <Button
          className="w-full bg-primary hover:bg-primary/90"
          onClick={handleJoinSession}
        >
          Join Session <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
      )}

      {canCancel && (
        <>
          <div className="flex justify-center">
            <Textarea
              placeholder="Please provide a reason for cancellation..."
              value={cancellationNote}
              onChange={(e) => onCancellationNoteChange(e.target.value)}
              className="h-24 resize-none bg-muted w-3/4"
            />
          </div>
          
          <Button
            variant="destructive"
            onClick={handleCancelSession}
            disabled={!cancellationNote.trim() || isCancelling}
            className="w-full bg-[#ea384c] hover:bg-[#ea384c]/90"
          >
            {isCancelling ? "Cancelling..." : "Cancel Session"}
          </Button>
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
  );
}