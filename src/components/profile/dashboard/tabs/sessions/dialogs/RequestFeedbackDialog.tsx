
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
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
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mentorFeedbackProvided, setMentorFeedbackProvided] = useState(false);
  const [menteeFeedbackProvided, setMenteeFeedbackProvided] = useState(false);
  const { session } = useAuthSession();
  const { toast } = useToast();

  // Check if feedback already exists for this session
  useEffect(() => {
    if (isOpen && sessionId) {
      setIsChecking(true);
      checkExistingFeedback();
    }
  }, [isOpen, sessionId]);

  const checkExistingFeedback = async () => {
    try {
      if (!sessionId) return;
      
      const { data: sessionData, error: fetchError } = await supabase
        .from("mentor_sessions")
        .select(`
          id, 
          mentor_id, 
          mentee_id
        `)
        .eq("id", sessionId)
        .single();
      
      if (fetchError) throw fetchError;
      if (!sessionData) throw new Error("Session not found");
      
      // Check for existing feedback
      const { data: feedbackData, error: feedbackError } = await supabase
        .from("session_feedback")
        .select("*")
        .eq("session_id", sessionId);
        
      if (feedbackError) throw feedbackError;
      
      // Check if mentor and mentee have already provided feedback
      if (feedbackData && feedbackData.length > 0) {
        const mentorFeedback = feedbackData.find(f => 
          f.from_profile_id === sessionData.mentor_id && 
          f.feedback_type === 'mentor_feedback'
        );
        const menteeFeedback = feedbackData.find(f => 
          f.from_profile_id === sessionData.mentee_id && 
          f.feedback_type === 'mentee_feedback'
        );
        
        setMentorFeedbackProvided(!!mentorFeedback);
        setMenteeFeedbackProvided(!!menteeFeedback);
      } else {
        setMentorFeedbackProvided(false);
        setMenteeFeedbackProvided(false);
      }
    } catch (err: any) {
      console.error("Error checking existing feedback:", err);
      setError("Failed to check existing feedback: " + err.message);
    } finally {
      setIsChecking(false);
    }
  };

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
      
      // 2. Create notifications for parties that haven't provided feedback yet
      const notificationsToCreate = [];
      
      if (!mentorFeedbackProvided) {
        notificationsToCreate.push({
          profile_id: sessionData.mentor_id,
          title: "Session Feedback Request",
          message: `Please provide feedback for your session with ${sessionData.mentee.full_name}`,
          type: "session_reminder",
          action_url: `/profile?tab=calendar&feedbackSession=${sessionId}&feedbackType=mentor_feedback`,
          category: "mentorship"
        });
      }
      
      if (!menteeFeedbackProvided) {
        notificationsToCreate.push({
          profile_id: sessionData.mentee_id,
          title: "Session Feedback Request",
          message: `Please provide feedback for your session with ${sessionData.mentor.full_name}`,
          type: "session_reminder",
          action_url: `/profile?tab=calendar&feedbackSession=${sessionId}&feedbackType=mentee_feedback`,
          category: "mentorship"
        });
      }
      
      // Only proceed if there's at least one notification to create
      if (notificationsToCreate.length === 0) {
        toast({
          title: "No action needed",
          description: "Both participants have already provided feedback for this session.",
        });
        onSuccess();
        onClose();
        return;
      }
      
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
        const { data: emailResponse, error: emailError } = await supabase.functions.invoke("send-session-email", {
          body: {
            sessionId,
            type: "feedback_request"
          }
        });
        
        if (emailError) {
          // Log but don't throw error for email failures
          console.error("Error sending email notifications:", emailError);
          console.log("Continuing process despite email failure");
        } else {
          console.log("Email notifications sent successfully:", emailResponse);
        }
      } catch (emailError) {
        // Log but don't throw error for email failures
        console.error("Error invoking email function:", emailError);
        // We continue even if emails fail
      }
      
      toast({
        title: "Feedback requested",
        description: "Feedback requests have been sent to participants who haven't provided feedback yet.",
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

  const getFeedbackStatusMessage = () => {
    if (mentorFeedbackProvided && menteeFeedbackProvided) {
      return "Both participants have already provided feedback for this session.";
    } else if (mentorFeedbackProvided) {
      return `${mentorName} has already provided feedback. Only ${menteeName} will be sent a request.`;
    } else if (menteeFeedbackProvided) {
      return `${menteeName} has already provided feedback. Only ${mentorName} will be sent a request.`;
    }
    return "Neither participant has provided feedback yet.";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request Session Feedback</DialogTitle>
          <DialogDescription>
            This will send a notification and email to participants who haven't provided feedback for their session yet.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {isChecking ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Checking feedback status...</span>
            </div>
          ) : (
            <div className="mb-4 text-sm space-y-4">
              <div className="mb-4">
                <p><strong>Session participants:</strong></p>
                <p>Mentor: {mentorName} {mentorFeedbackProvided && <CheckCircle2 className="inline h-4 w-4 text-green-500 ml-1" />}</p>
                <p>Mentee: {menteeName} {menteeFeedbackProvided && <CheckCircle2 className="inline h-4 w-4 text-green-500 ml-1" />}</p>
              </div>
              
              <div className={`p-3 rounded-md flex items-start ${(mentorFeedbackProvided || menteeFeedbackProvided) ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>
                {(mentorFeedbackProvided || menteeFeedbackProvided) ? (
                  <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                ) : null}
                <p>{getFeedbackStatusMessage()}</p>
              </div>
              
              <p className="mt-4">
                Participants will receive a notification and an email with a link to submit their feedback.
              </p>
            </div>
          )}
          
          {error && (
            <div className="mt-2 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting || isChecking}>
            Cancel
          </Button>
          <Button 
            onClick={handleRequestFeedback} 
            disabled={isSubmitting || isChecking || (mentorFeedbackProvided && menteeFeedbackProvided)}
          >
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
