
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
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  const handleRequestFeedback = async () => {
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
          mentor:profiles!mentor_sessions_mentor_id_fkey(full_name, email), 
          mentee:profiles!mentor_sessions_mentee_id_fkey(full_name, email)
        `)
        .eq("id", sessionId)
        .single();
      
      if (fetchError) throw fetchError;
      if (!sessionData) throw new Error("Session not found");
      
      console.log("Retrieved session data:", sessionData);
      
      // 2. Create notifications for both parties
      const notificationsToCreate = [
        {
          profile_id: sessionData.mentor_id,
          title: "Session Feedback Request",
          message: `Please provide feedback for your session with ${sessionData.mentee.full_name}`,
          type: "session_reminder",
          action_url: `/profile?tab=calendar&feedbackSession=${sessionId}&feedbackType=mentor_feedback`,
          category: "mentorship"
        },
        {
          profile_id: sessionData.mentee_id,
          title: "Session Feedback Request",
          message: `Please provide feedback for your session with ${sessionData.mentor.full_name}`,
          type: "session_reminder",
          action_url: `/profile?tab=calendar&feedbackSession=${sessionId}&feedbackType=mentee_feedback`,
          category: "mentorship"
        }
      ];
      
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert(notificationsToCreate);
      
      if (notificationError) {
        console.error("Error creating notifications:", notificationError);
        throw notificationError;
      }
      
      console.log("Notifications created successfully");
      
      // 3. Send email notifications
      try {
        await supabase.functions.invoke("send-session-email", {
          body: {
            sessionId,
            type: "feedback_request"
          }
        });
        console.log("Email notifications sent successfully");
      } catch (emailError) {
        // Log but don't throw error for email failures
        console.error("Error sending email notifications:", emailError);
        // We continue even if emails fail
      }
      
      toast({
        title: "Feedback requested",
        description: "Feedback requests have been sent to both participants.",
      });
      
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error requesting feedback:", err);
      setError(err.message || "An unexpected error occurred");
      
      toast({
        title: "Request failed",
        description: err.message || "Failed to send feedback requests",
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
