
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { BookingForm } from "./booking/BookingForm";
import { useSessionBooking } from "./booking/SessionBookingHandler";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuthSession } from "@/hooks/useAuthSession";
import { MeetingPlatform } from "@/types/calendar";

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
  const [formData, setFormData] = useState<{
    date?: Date;
    selectedTime?: string;
    sessionType?: string;
    note: string;
    meetingPlatform: MeetingPlatform;
    menteePhoneNumber?: string;
    menteeTelegramUsername?: string;
  }>({
    note: "",
    meetingPlatform: "Google Meet"
  });

  const handleSessionBooking = useSessionBooking();
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);

  if (!mentor) {
    return null;
  }

  const handleSuccess = () => {
    handleSessionBooking({
      mentorId: mentor.id,
      mentorName: mentor.name,
      menteeName: profile?.full_name || 'Unknown User',
      formData,
      onSuccess: () => onOpenChange(false),
      onError: (error) => {
        console.error('Booking error:', error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book a Session with {mentor.name}</DialogTitle>
          <DialogDescription>
            Select your preferred date, time, and session type
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <BookingForm
            mentorId={mentor.id}
            onFormChange={setFormData}
            onSuccess={handleSuccess}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
