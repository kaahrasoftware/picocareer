
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
  const { session } = useAuthSession();

  const handleDelete = async () => {
    if (!session?.access_token) return;
    
    setIsDeleting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("admin-session-actions", {
        body: {
          action: "delete",
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
      console.error("Error deleting session:", error);
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
