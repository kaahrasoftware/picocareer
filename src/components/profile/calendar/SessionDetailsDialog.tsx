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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Session Details</DialogTitle>
          <DialogDescription>
            View session details and manage your booking
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium">Session Type</h4>
            <p className="text-sm text-muted-foreground">
              {session.session_details.session_type.type}
            </p>
          </div>

          <div>
            <h4 className="font-medium">Time</h4>
            <p className="text-sm text-muted-foreground">
              {formatInTimeZone(
                new Date(session.start_time),
                userTimezone,
                "PPP p"
              )}
            </p>
          </div>

          <div>
            <h4 className="font-medium">Duration</h4>
            <p className="text-sm text-muted-foreground">
              {session.session_details.session_type.duration} minutes
            </p>
          </div>

          <div>
            <h4 className="font-medium">Participants</h4>
            <p className="text-sm text-muted-foreground">
              Mentor: {session.session_details.mentor.full_name}<br />
              Mentee: {session.session_details.mentee.full_name}
            </p>
          </div>

          {session.status === 'cancelled' ? (
            <div className="flex items-center gap-2 text-red-500">
              <AlertCircle className="h-4 w-4" />
              <span>This session has been cancelled</span>
            </div>
          ) : (
            <>
              {canMarkAttendance && (
                <div className="flex items-center space-x-2">
                  <Switch
                    id="attendance"
                    checked={attendance}
                    onCheckedChange={handleAttendanceToggle}
                  />
                  <Label htmlFor="attendance">Confirm Attendance</Label>
                </div>
              )}

              {session.session_details.meeting_link && (
                <Button
                  className="w-full"
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
                    className="h-24"
                  />
                  
                  <DialogFooter>
                    <Button
                      variant="destructive"
                      onClick={onCancel}
                      disabled={!cancellationNote.trim()}
                    >
                      Cancel Session
                    </Button>
                  </DialogFooter>
                </>
              )}

              {!canCancel && (
                <div className="flex items-center gap-2 text-sm text-yellow-500">
                  <AlertCircle className="h-4 w-4" />
                  Sessions cannot be cancelled less than 1 hour before the start time
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}