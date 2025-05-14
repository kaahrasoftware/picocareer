
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
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";

interface RequestFeedbackDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  mentorName: string;
  menteeName: string;
  onSuccess: () => void;
}

export function RequestFeedbackDialog({
  isOpen,
  onClose,
  sessionId,
  mentorName,
  menteeName,
  onSuccess,
}: RequestFeedbackDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuthSession();

  const handleRequestFeedback = async () => {
    if (!session?.access_token) {
      setError("Authentication required. Please login again.");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      console.log("Calling admin-session-actions with:", {
        action: "requestFeedback",
        sessionId
      });
      
      const { data, error } = await supabase.functions.invoke("admin-session-actions", {
        body: {
          action: "requestFeedback",
          sessionId,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      
      if (error) {
        console.error("Error requesting feedback:", error);
        throw new Error(error.message || "Failed to request feedback");
      }
      
      console.log("Request feedback response:", data);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error requesting feedback:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request Session Feedback</DialogTitle>
          <DialogDescription>
            This will send a notification and email to both the mentor and mentee requesting feedback for their session.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="mb-4 text-sm space-y-2">
            <p><strong>Session participants:</strong></p>
            <p>Mentor: {mentorName}</p>
            <p>Mentee: {menteeName}</p>
            
            <p className="mt-4">
              Both participants will receive a notification and an email with a link to submit their feedback.
            </p>
          </div>
          
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
          <Button onClick={handleRequestFeedback} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
              </>
            ) : (
              "Send Feedback Requests"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
