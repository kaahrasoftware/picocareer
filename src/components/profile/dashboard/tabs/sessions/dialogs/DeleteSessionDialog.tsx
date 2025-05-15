
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
import { Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";
import { toast } from "sonner";

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
  const [error, setError] = useState<string | null>(null);
  const { session, refreshSession } = useAuthSession();

  const handleDelete = async () => {
    if (!session?.access_token) {
      setError("Authentication required. Please login again.");
      return;
    }
    
    setIsDeleting(true);
    setError(null);
    
    try {
      // Try to refresh the session first to ensure we have a valid token
      const isSessionValid = await refreshSession();
      if (!isSessionValid) {
        throw new Error("Failed to refresh authentication session");
      }
      
      console.log("Calling admin-session-actions with:", {
        action: "delete",
        sessionId
      });
      
      // For easier debugging, log the full request details
      console.log("Request details:", {
        url: `${supabase.functions.url}/admin-session-actions`,
        token: `Bearer ${session.access_token.substring(0, 10)}...`, // Only log part of the token for security
        sessionId,
      });
      
      const { data, error } = await supabase.functions.invoke("admin-session-actions", {
        body: {
          action: "delete",
          sessionId,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      
      if (error) {
        console.error("Error deleting session:", error);
        throw new Error(error.message || "Failed to delete session");
      }
      
      console.log("Delete session response:", data);
      toast.success("Session deleted successfully");
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error in session deletion:", err);
      setError(err.message || "An unexpected error occurred");
      toast.error(`Failed to delete session: ${err.message || "Unknown error"}`);
      
      // If we get an authentication error, try to refresh the session
      if (err.message?.includes("authentication") || err.message?.includes("token") || err.message?.includes("auth")) {
        toast.error("Authentication error. Trying to refresh your session...");
        const refreshed = await refreshSession();
        if (refreshed) {
          toast.info("Session refreshed. Please try again.");
        } else {
          toast.error("Could not refresh session. Please log out and back in.");
        }
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center text-destructive">
            <AlertCircle className="mr-2 h-5 w-5" />
            Delete Session
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the session and
            remove all associated data.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 text-sm">
          <p>Are you sure you want to delete this session?</p>
          <p className="mt-2 font-medium">{sessionDetails}</p>
          
          {error && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
              <p><strong>Error:</strong> {error}</p>
              <p className="text-xs mt-1">Please check your admin permissions and connection status.</p>
            </div>
          )}
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
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
