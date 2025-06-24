
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { BookingForm } from "./booking/BookingForm";

interface BookSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mentor?: {
    id: string;
    name: string;
    imageUrl: string;
  };
}

export function BookSessionDialog({ open, onOpenChange, mentor }: BookSessionDialogProps) {
  if (!mentor) {
    return null;
  }

  const handleSuccess = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book a Session with {mentor.name}</DialogTitle>
          <DialogDescription>
            Select your preferred date, time, and session type. Sessions cost 25 tokens.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <BookingForm
            mentorId={mentor.id}
            onBookingComplete={handleSuccess}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
