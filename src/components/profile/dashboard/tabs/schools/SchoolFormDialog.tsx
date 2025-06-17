
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { School } from "@/types/database/schools";

interface SchoolFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  school?: School;
  onSuccess: () => void;
  open?: boolean;
  mode?: string;
}

export function SchoolFormDialog({ isOpen, open, onClose, school, onSuccess }: SchoolFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dialogOpen = isOpen || open || false;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Add form submission logic here
    setTimeout(() => {
      setIsSubmitting(false);
      onSuccess();
      onClose();
    }, 1000);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={(newOpen) => !newOpen && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{school ? 'Edit School' : 'Add School'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>School form will be implemented here</p>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
