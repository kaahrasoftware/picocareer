
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
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reason, setReason] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuthSession();

  const statusLabels: Record<string, string> = {
    completed: "Mark as Completed",
    cancelled: "Mark as Cancelled",
    no_show: "Mark as No-Show",
    scheduled: "Mark as Scheduled",
  };

  const handleSubmit = async () => {
    if (!session?.access_token) {
      setError("Authentication required. Please login again.");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      console.log("Calling admin-session-actions with:", {
        action: "updateStatus",
        sessionId,
        status: targetStatus,
        reason
      });
      
      const { data, error } = await supabase.functions.invoke("admin-session-actions", {
        body: {
          action: "updateStatus",
          sessionId,
          status: targetStatus,
          reason: reason.trim() || null,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      
      if (error) {
        console.error("Error updating session status:", error);
        throw new Error(error.message || "Failed to update session status");
      }
      
      console.log("Status update response:", data);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error in status update:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {statusLabels[targetStatus] || `Update Session Status to ${targetStatus}`}
          </DialogTitle>
          <DialogDescription>
            This action will update the session status and notify both the mentor and mentee.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="mb-4 text-sm">
            <p className="font-medium">Session Details:</p>
            <p>{sessionDetails}</p>
          </div>
          
          <Textarea
            placeholder="Enter an optional reason or notes for this status change..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-h-[100px]"
          />
          
          {error && (
            <div className="mt-2 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
              </>
            ) : (
              statusLabels[targetStatus] || "Update Status"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
