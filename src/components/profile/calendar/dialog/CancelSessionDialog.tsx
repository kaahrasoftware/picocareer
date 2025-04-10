
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { useSessionManagement } from "@/hooks/useSessionManagement";

interface CancelSessionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  scheduledTime: Date;
  withParticipant: string;
  onSuccess?: () => void;
}

export function CancelSessionDialog({
  isOpen,
  onClose,
  sessionId,
  scheduledTime,
  withParticipant,
  onSuccess
}: CancelSessionDialogProps) {
  const [reason, setReason] = useState("");
  const { cancelSession, isLoading } = useSessionManagement();

  const handleCancel = async () => {
    try {
      await cancelSession.mutateAsync({
        sessionId,
        reason
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // Error handling is done in the useSessionManagement hook
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Cancel Session</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-2">
          <div className="text-sm">
            <p>Are you sure you want to cancel your session with <span className="font-medium">{withParticipant}</span>?</p>
            <p className="text-muted-foreground mt-2">
              Scheduled for {format(scheduledTime, "MMMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium">Reason for cancellation</p>
            <Textarea
              placeholder="Please provide a reason for cancellation (optional)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" onClick={onClose}>
              Keep Appointment
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancel}
              disabled={isLoading}
            >
              {isLoading ? "Cancelling..." : "Cancel Session"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
