import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, ExternalLink } from "lucide-react";
import { CalendarEvent } from "@/types/calendar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

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
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

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
    if (!session.session_details?.id) return;
    
    setIsProcessing(true);
    try {
      // Cancel Google Calendar event if it exists
      if (session.session_details?.calendar_event_id) {
        console.log('Cancelling Google Calendar event:', session.session_details.calendar_event_id);
        
        const { error: cancelError } = await supabase.functions.invoke('cancel-meet-link', {
          body: { 
            sessionId: session.session_details.id 
          }
        });

        if (cancelError) {
          console.error('Error cancelling Google Calendar event:', cancelError);
          throw new Error('Failed to cancel Google Calendar event');
        }
      }

      // Update session status
      const { error: updateError } = await supabase
        .from('mentor_sessions')
        .update({ 
          status: 'cancelled',
          notes: cancellationNote 
        })
        .eq('id', session.session_details.id);

      if (updateError) throw updateError;

      // Create notifications for both mentor and mentee
      const notifications = [
        {
          profile_id: session.session_details.mentor.id,
          title: 'Session Cancelled',
          message: `Session with ${session.session_details.mentee.full_name} has been cancelled. Reason: ${cancellationNote}`,
          type: 'session_cancelled',
          action_url: '/profile?tab=calendar',
          category: 'mentorship'
        },
        {
          profile_id: session.session_details.mentee.id,
          title: 'Session Cancelled',
          message: `Session with ${session.session_details.mentor.full_name} has been cancelled. Reason: ${cancellationNote}`,
          type: 'session_cancelled',
          action_url: '/profile?tab=calendar',
          category: 'mentorship'
        }
      ];

      const { error: notificationError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (notificationError) throw notificationError;

      // Send email notifications
      await supabase.functions.invoke('send-session-email', {
        body: { 
          sessionId: session.session_details.id,
          type: 'cancellation'
        }
      });

      toast({
        title: "Session cancelled",
        description: "The session has been cancelled successfully",
      });

      // Invalidate and refetch session events
      await queryClient.invalidateQueries({ queryKey: ['session-events'] });
      
      onClose();
    } catch (error) {
      console.error('Error cancelling session:', error);
      toast({
        title: "Error",
        description: "Failed to cancel the session",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
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
            disabled={!cancellationNote.trim() || isProcessing}
            className="w-full bg-[#ea384c] hover:bg-[#ea384c]/90"
          >
            {isProcessing ? "Cancelling..." : "Cancel Session"}
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