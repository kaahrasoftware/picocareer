import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CalendarEvent } from "@/types/calendar";
import { AlertCircle } from "lucide-react";

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
  if (!session?.session_details) return null;

  const sessionTime = new Date(session.start_time);
  const canCancel = sessionTime > new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

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
              {format(new Date(session.start_time), "PPP p")}
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

          {session.status && (
            <div>
              <h4 className="font-medium">Status</h4>
              <Badge 
                variant={session.status === 'cancelled' ? 'destructive' : 'default'}
                className="mt-1"
              >
                {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
              </Badge>
            </div>
          )}

          {(!session.status || session.status !== 'cancelled') && (
            <>
              {!canCancel && (
                <div className="flex items-center gap-2 text-sm text-yellow-500">
                  <AlertCircle className="h-4 w-4" />
                  Sessions cannot be cancelled less than 1 hour before the start time
                </div>
              )}
              
              <Textarea
                placeholder="Please provide a reason for cancellation..."
                value={cancellationNote}
                onChange={(e) => onCancellationNoteChange(e.target.value)}
                className="h-24"
                disabled={!canCancel}
              />
              
              <DialogFooter>
                <Button
                  variant="destructive"
                  onClick={onCancel}
                  disabled={!canCancel || !cancellationNote.trim()}
                >
                  Cancel Session
                </Button>
              </DialogFooter>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}