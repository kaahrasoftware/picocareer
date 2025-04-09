
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { useSessionManagement } from "@/hooks/useSessionManagement";

interface CancelSessionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  scheduledTime: Date;
  withParticipant: string;
}

export function CancelSessionDialog({
  isOpen,
  onClose,
  sessionId,
  scheduledTime,
  withParticipant,
}: CancelSessionDialogProps) {
  const [reason, setReason] = useState("");
  const { cancelSession, isLoading } = useSessionManagement();

  const handleCancel = async () => {
    if (!reason.trim()) {
      return;
    }

    try {
      await cancelSession.mutateAsync({
        sessionId,
        reason,
      });
      onClose();
    } catch (error) {
      console.error("Failed to cancel session:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cancel Session</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel your session with {withParticipant} on{" "}
            {format(scheduledTime, "MMMM d, yyyy 'at' h:mm a")}?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">
              Please provide a reason for cancellation
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="E.g., Schedule conflict, emergency, etc."
              className="min-h-[100px]"
              required
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Go Back
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleCancel} 
            disabled={isLoading || !reason.trim()}
          >
            {isLoading ? "Cancelling..." : "Cancel Session"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
