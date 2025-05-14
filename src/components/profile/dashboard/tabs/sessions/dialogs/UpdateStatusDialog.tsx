
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuthSession } from "@/hooks/useAuthSession";
import { supabase } from "@/integrations/supabase/client";

interface UpdateStatusDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  sessionDetails: string;
  targetStatus: string;
  onSuccess: () => void;
}

export function UpdateStatusDialog({
  isOpen,
  onClose,
  sessionId,
  sessionDetails,
  targetStatus,
  onSuccess,
}: UpdateStatusDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [reason, setReason] = useState("");
  const { session } = useAuthSession();

  const statusText: Record<string, string> = {
    completed: "mark this session as completed",
    no_show: "mark this session as a no-show",
    cancelled: "cancel this session",
    scheduled: "mark this session as scheduled",
  };

  const handleUpdateStatus = async () => {
    if (!session?.access_token) return;
    
    setIsProcessing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("admin-session-actions", {
        body: {
          action: "updateStatus",
          sessionId,
          status: targetStatus,
          reason: reason.trim() || undefined,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      
      if (error) throw error;
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating session status:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {targetStatus === "completed"
              ? "Mark Session as Completed"
              : targetStatus === "no_show"
              ? "Mark Session as No-Show"
              : targetStatus === "cancelled"
              ? "Cancel Session"
              : "Update Session Status"}
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to {statusText[targetStatus] || "update the status of this session"}?
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-2 text-sm">
          <p className="font-medium">{sessionDetails}</p>
        </div>
        
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason (optional)</Label>
            <Textarea
              id="reason"
              placeholder="Enter reason for this status change..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="resize-none"
            />
          </div>
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button onClick={handleUpdateStatus} disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
              </>
            ) : (
              "Confirm"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
