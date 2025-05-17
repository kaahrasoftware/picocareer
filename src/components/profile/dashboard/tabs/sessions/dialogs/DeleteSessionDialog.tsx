
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Loader2, InfoIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useQuery } from "@tanstack/react-query";

interface DeleteSessionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  sessionDetails: string;
  onSuccess: () => void;
}

export function DeleteSessionDialog({
  isOpen,
  onClose,
  sessionId,
  sessionDetails,
  onSuccess,
}: DeleteSessionDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingFeedback, setIsDeletingFeedback] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { session } = useAuthSession();

  // State to track if feedback exists and has been deleted
  const [feedbackDeleted, setFeedbackDeleted] = useState(false);

  // Fetch session feedback data to check if any exists
  const { 
    data: feedbackData, 
    isLoading: isLoadingFeedback, 
    refetch: refetchFeedback 
  } = useQuery({
    queryKey: ["session-feedback-check", sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("session_feedback")
        .select("id, feedback_type")
        .eq("session_id", sessionId);
        
      if (error) throw error;
      return data;
    },
    enabled: isOpen && !!sessionId,
  });

  // Reset feedback deleted state when the dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setFeedbackDeleted(false);
      setError(null);
    }
  }, [isOpen]);

  const handleDeleteFeedback = async () => {
    if (!session?.access_token) {
      toast({
        title: "Authentication required",
        description: "You must be logged in as an admin to perform this action",
        variant: "destructive",
      });
      return;
    }

    setIsDeletingFeedback(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("session_feedback")
        .delete()
        .eq("session_id", sessionId);

      if (error) {
        throw new Error(error.message || "Failed to delete session feedback");
      }

      toast({
        title: "Feedback deleted",
        description: "Session feedback has been successfully deleted",
      });

      setFeedbackDeleted(true);
      refetchFeedback(); // Refresh feedback data
    } catch (err: any) {
      console.error("Error deleting session feedback:", err);
      
      setError(err.message || "Failed to delete session feedback. Please try again.");
      
      toast({
        title: "Feedback deletion failed",
        description: err.message || "An error occurred while deleting the session feedback",
        variant: "destructive",
      });
    } finally {
      setIsDeletingFeedback(false);
    }
  };

  const handleDelete = async () => {
    if (!session?.user?.id) {
      toast({
        title: "Authentication required",
        description: "You must be logged in as an admin to perform this action",
        variant: "destructive",
      });
      return;
    }

    // Check if feedback exists and hasn't been deleted yet
    if (feedbackData && feedbackData.length > 0 && !feedbackDeleted) {
      toast({
        title: "Feedback exists",
        description: "Please delete session feedback first before deleting the session",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
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
      
      // 2. Update any availability slot that references this session
      const { error: availabilityError } = await supabase
        .from("mentor_availability")
        .update({
          is_available: true,
          booked_session_id: null
        })
        .eq("booked_session_id", sessionId);
        
      if (availabilityError) {
        console.error("Error updating availability slots:", availabilityError);
        // Continue even if this fails
      }
      
      // 3. Delete the session
      const { error: deleteError } = await supabase
        .from("mentor_sessions")
        .delete()
        .eq("id", sessionId);
        
      if (deleteError) throw deleteError;
      
      // 4. Create notifications for both parties
      const notificationsToCreate = [
        {
          profile_id: sessionData.mentor_id,
          title: "Session Deleted",
          message: `Your session with ${sessionData.mentee.full_name} has been deleted by an administrator.`,
          type: "session_update",
          action_url: "/profile?tab=calendar",
          category: "general"
        },
        {
          profile_id: sessionData.mentee_id,
          title: "Session Deleted",
          message: `Your session with ${sessionData.mentor.full_name} has been deleted by an administrator.`,
          type: "session_update",
          action_url: "/profile?tab=calendar",
          category: "general"
        }
      ];
      
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert(notificationsToCreate);
      
      if (notificationError) {
        console.error("Error creating notifications:", notificationError);
        // We'll continue even if notifications fail
      }

      toast({
        title: "Session deleted",
        description: "The session has been permanently deleted",
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error deleting session:", err);
      
      setError(err.message || "Failed to delete session. Please try again.");
      
      toast({
        title: "Delete failed",
        description: err.message || "An error occurred while deleting the session",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const hasFeedback = feedbackData && feedbackData.length > 0;
  const feedbackMessage = hasFeedback 
    ? `This session has ${feedbackData.length} feedback record(s). You must delete them first.`
    : "No feedback records found for this session.";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Session
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="mb-2">
            Are you sure you want to permanently delete this session?
          </p>
          <p className="text-sm text-muted-foreground mb-4">{sessionDetails}</p>
          
          {isLoadingFeedback ? (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Checking for feedback records...
            </div>
          ) : (
            <div className={`p-3 mb-4 rounded-md flex items-start gap-2 ${
              hasFeedback && !feedbackDeleted 
                ? "bg-amber-50 border border-amber-200"
                : "bg-slate-50 border border-slate-200"
            }`}>
              <InfoIcon className={`h-5 w-5 mt-0.5 ${
                hasFeedback && !feedbackDeleted ? "text-amber-500" : "text-slate-500"
              }`} />
              <div>
                <p className="text-sm font-medium">
                  {hasFeedback && !feedbackDeleted 
                    ? "Feedback Records Exist" 
                    : feedbackDeleted 
                      ? "Feedback Records Deleted" 
                      : "No Feedback Records"}
                </p>
                <p className="text-sm">{feedbackMessage}</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col space-y-2 sm:space-y-0">
          {hasFeedback && !feedbackDeleted && (
            <div className="w-full sm:w-auto">
              <Button 
                variant="secondary" 
                onClick={handleDeleteFeedback} 
                disabled={isDeletingFeedback || isDeleting || isLoadingFeedback}
                className="w-full"
              >
                {isDeletingFeedback && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isDeletingFeedback ? "Deleting Feedback..." : "Delete Feedback First"}
              </Button>
            </div>
          )}
          
          <div className="flex w-full justify-between gap-2 sm:w-auto">
            <Button variant="outline" onClick={onClose} disabled={isDeleting || isDeletingFeedback}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete} 
              disabled={isDeleting || isDeletingFeedback || (hasFeedback && !feedbackDeleted) || isLoadingFeedback}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isDeleting ? "Deleting..." : "Delete Session"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
