
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";

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
  const { toast } = useToast();
  const { session } = useAuthSession();

  const handleDelete = async () => {
    if (!session?.access_token) {
      toast({
        title: "Authentication required",
        description: "You must be logged in as an admin to perform this action",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke("delete-session", {
        body: { sessionId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw new Error(error.message || "Failed to delete session");
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
          <p className="text-sm text-muted-foreground">{sessionDetails}</p>
          
          {error && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
