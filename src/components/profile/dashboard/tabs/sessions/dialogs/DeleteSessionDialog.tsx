
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
  const [reason, setReason] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuthSession();
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!session?.user?.id) {
      setError("Authentication required. Please login again.");
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
      
      console.log("Retrieved session data for deletion:", sessionData);
      
      // 2. Delete the session
      const { error: deleteError } = await supabase
        .from("mentor_sessions")
        .delete()
        .eq("id", sessionId);
      
      if (deleteError) throw deleteError;
      
      console.log("Session deleted successfully");
      
      // 3. Create notifications for both parties
      const notificationsToCreate = [
        {
          profile_id: sessionData.mentor_id,
          title: "Session Deleted",
          message: `Your session with ${sessionData.mentee.full_name} has been deleted${reason ? `: "${reason}"` : ""}.`,
          type: "session_update" as const,
          action_url: "/profile?tab=calendar",
          category: "general" as const
        },
        {
          profile_id: sessionData.mentee_id,
          title: "Session Deleted",
          message: `Your session with ${sessionData.mentor.full_name} has been deleted${reason ? `: "${reason}"` : ""}.`,
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
        title: "Session deleted",
        description: "The session has been permanently deleted.",
      });
      
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error deleting session:", err);
      setError(err.message || "An unexpected error occurred");
      
      toast({
        title: "Delete failed",
        description: err.message || "Failed to delete session",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Session</DialogTitle>
          <DialogDescription>
            This action will permanently delete the session and notify both the mentor and mentee. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="mb-4 text-sm">
            <p className="font-medium">Session Details:</p>
            <p>{sessionDetails}</p>
          </div>
          
          <Textarea
            placeholder="Enter an optional reason for deleting this session..."
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
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button 
            onClick={handleDelete} 
            disabled={isDeleting}
            variant="destructive"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
              </>
            ) : (
              "Delete Session"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
