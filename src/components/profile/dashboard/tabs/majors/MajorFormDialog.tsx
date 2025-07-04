
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Major } from "@/types/database/majors";

interface MajorFormDialogProps {
  isOpen?: boolean;
  open?: boolean;
  onClose: () => void;
  major?: Major;
  onSuccess: () => void;
}

export function MajorFormDialog({ isOpen, open, onClose, major, onSuccess }: MajorFormDialogProps) {
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

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      onClose();
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{major ? 'Edit Major' : 'Add Major'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>Major form will be implemented here</p>
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
