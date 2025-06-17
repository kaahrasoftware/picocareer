
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
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  const statusLabels: Record<string, string> = {
    completed: "Mark as Completed",
    cancelled: "Mark as Cancelled",
    no_show: "Mark as No-Show",
    scheduled: "Mark as Scheduled",
  };

  const handleSubmit = async () => {
    if (!session?.user?.id) {
      setError("Authentication required. Please login again.");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // 1. Get session details for notifications
      const { data: sessionData, error: fetchError } = await supabase
        .from("mentor_sessions")
        .select(`
          id, 
          mentor_id, 
          mentee_id, 
          mentor:profiles!mentor_sessions_mentor_id_fkey(full_name), 
          mentee:profiles!mentor_sessions_mentee_id_fkey(full_name)
        `)
        .eq("id", sessionId)
        .single();
      
      if (fetchError) throw fetchError;
      if (!sessionData) throw new Error("Session not found");
      
      console.log("Retrieved session data:", sessionData);
      
      // 2. Update the session status directly
      const { error: updateError } = await supabase
        .from("mentor_sessions")
        .update({ 
          status: targetStatus,
          notes: reason.trim() ? `${reason.trim()} [Status changed to ${targetStatus}]` : `Status changed to ${targetStatus}`
        })
        .eq("id", sessionId);
      
      if (updateError) throw updateError;
      
      console.log("Session status updated successfully");
      
      // 3. Create notifications for both parties
      const notificationsToCreate = [
        {
          profile_id: sessionData.mentor_id,
          title: `Session ${targetStatus}`,
          message: `Your session with ${sessionData.mentee.full_name} has been marked as ${targetStatus}${reason ? `: "${reason}"` : ""}.`,
          type: "session_update" as const,
          action_url: "/profile?tab=calendar",
          category: "general" as const
        },
        {
          profile_id: sessionData.mentee_id,
          title: `Session ${targetStatus}`,
          message: `Your session with ${sessionData.mentor.full_name} has been marked as ${targetStatus}${reason ? `: "${reason}"` : ""}.`,
          type: "session_update" as const,
          action_url: "/profile?tab=calendar",
          category: "general" as const
        }
      ];
      
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert(notificationsToCreate);
      
      if (notificationError) {
        console.error("Error creating notifications:", notificationError);
        // We'll continue even if notifications fail
      } else {
        console.log("Notifications created successfully");
      }
      
      toast({
        title: "Status updated",
        description: `Session has been marked as ${targetStatus}.`,
      });
      
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error updating session status:", err);
      setError(err.message || "An unexpected error occurred");
      
      toast({
        title: "Update failed",
        description: err.message || "Failed to update session status",
        variant: "destructive",
      });
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
