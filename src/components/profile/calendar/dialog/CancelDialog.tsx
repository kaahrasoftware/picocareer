
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSessionManagement } from "@/hooks/useSessionManagement";
import { useToast } from "@/hooks/use-toast";

interface CancelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  onCancelled?: () => void;
}

export function CancelDialog({
  isOpen,
  onClose,
  sessionId,
  onCancelled,
}: CancelDialogProps) {
  const [reason, setReason] = useState("");
  const { toast } = useToast();
  const { cancelSession, isLoading } = useSessionManagement();

  const handleCancel = async () => {
    if (!reason.trim()) {
      toast({
        title: "Please provide a reason",
        description: "A reason is required when cancelling a session.",
        variant: "destructive",
      });
      return;
    }

    try {
      await cancelSession.mutateAsync({
        sessionId,
        reason,
      });
      
      if (onCancelled) {
        onCancelled();
      }
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
            Are you sure you want to cancel this session? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="reason" className="text-sm font-medium">
              Reason for cancellation
            </label>
            <Textarea
              id="reason"
              placeholder="Please provide a reason for cancellation..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="h-24"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Back
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
