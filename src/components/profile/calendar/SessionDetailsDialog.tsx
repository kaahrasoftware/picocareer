import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CalendarEvent } from "@/types/calendar";

interface SessionDetailsDialogProps {
  session: CalendarEvent | null;
  onClose: () => void;
  onCancel: (note: string) => Promise<void>;
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
              <Textarea
                placeholder="Please provide a reason for cancellation..."
                value={cancellationNote}
                onChange={(e) => onCancellationNoteChange(e.target.value)}
                className="h-24"
              />
              <DialogFooter>
                <Button
                  variant="destructive"
                  onClick={() => onCancel(cancellationNote)}
                  disabled={!cancellationNote.trim()}
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