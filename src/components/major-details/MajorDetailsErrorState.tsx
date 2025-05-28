
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface MajorDetailsErrorStateProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MajorDetailsErrorState({ open, onOpenChange }: MajorDetailsErrorStateProps) {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 mb-4 rounded-full bg-red-100 flex items-center justify-center">
        <span className="text-red-600 text-2xl">!</span>
      </div>
      <h3 className="text-lg font-semibold mb-2">Major not found</h3>
      <p className="text-muted-foreground">
        The major you're looking for doesn't exist or has been removed.
      </p>
    </div>
  );

  // If used as a dialog
  if (open !== undefined && onOpenChange) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  // If used as a page
  return content;
}
