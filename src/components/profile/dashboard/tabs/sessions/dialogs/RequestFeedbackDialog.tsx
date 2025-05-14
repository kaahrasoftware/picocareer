
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
import { Loader2, MessageSquare } from "lucide-react";
import { useAuthSession } from "@/hooks/useAuthSession";
import { supabase } from "@/integrations/supabase/client";

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
  const [isProcessing, setIsProcessing] = useState(false);
  const { session } = useAuthSession();

  const handleRequestFeedback = async () => {
    if (!session?.access_token) return;
    
    setIsProcessing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("admin-session-actions", {
        body: {
          action: "requestFeedback",
          sessionId,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      
      if (error) throw error;
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error requesting feedback:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <MessageSquare className="mr-2 h-5 w-5" />
            Request Session Feedback
          </DialogTitle>
          <DialogDescription>
            This will send notifications to both participants requesting their feedback on this session.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm">
            Feedback requests will be sent to:
          </p>
          <ul className="mt-2 space-y-1 text-sm">
            <li>• {mentorName} (Mentor)</li>
            <li>• {menteeName} (Mentee)</li>
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">
            Both in-app notifications and email notifications will be sent.
          </p>
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button onClick={handleRequestFeedback} disabled={isProcessing}>
            {isProcessing ? (
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
