
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BookingForm } from "./BookingForm";
import { BookingConfirmation } from "./BookingConfirmation";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuthSession } from "@/hooks/useAuthSession";
import { MeetingPlatform } from "@/types/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RequestAvailabilityButton } from "./RequestAvailabilityButton";
import { useSessionBooking } from "./SessionBookingHandler";

interface BookSessionDialogProps {
  mentor: {
    id: string;
    name: string;
    imageUrl: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookSessionDialog({ mentor, open, onOpenChange }: BookSessionDialogProps) {
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);
  const handleSessionBooking = useSessionBooking();

  const handleSubmit = async () => {
    if (!formData.date || !formData.selectedTime || !formData.sessionType || !mentor.id) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (formData.meetingPlatform === 'WhatsApp' && !formData.menteePhoneNumber) {
      toast({
        title: "Missing Information",
        description: "Please provide your phone number for WhatsApp sessions.",
        variant: "destructive"
      });
      return;
    }

    if (formData.meetingPlatform === 'Telegram' && !formData.menteeTelegramUsername) {
      toast({
        title: "Missing Information",
        description: "Please provide your Telegram username.",
        variant: "destructive"
      });
      return;
    }

    if (formData.meetingPlatform === 'Phone Call' && !formData.menteePhoneNumber) {
      toast({
        title: "Missing Information",
        description: "Please provide your phone number for Phone Call sessions.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await handleSessionBooking({
        mentorId: mentor.id,
        mentorName: mentor.name,
        menteeName: profile?.full_name || 'Unknown User',
        formData,
        onSuccess: () => {
          onOpenChange(false);
        },
        onError: (error) => {
          toast({
            title: "Booking Error",
            description: error.message || "Failed to book session. Please try again.",
            variant: "destructive"
          });
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = !!formData.date && !!formData.selectedTime && !!formData.sessionType && !!mentor.id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={mentor.imageUrl} alt={mentor.name} />
              <AvatarFallback>{mentor.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-2xl font-bold">
                Book a Session with {mentor.name}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Fill in the details below to schedule your mentoring session
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-6">
          <div className="bg-muted/30 rounded-lg p-6">
            <BookingForm 
              mentorId={mentor.id}
              onFormChange={setFormData}
            />

            {!isValid && formData.date && (
              <RequestAvailabilityButton
                mentorId={mentor.id}
                userId={session?.user?.id}
                onRequestComplete={() => onOpenChange(false)}
              />
            )}
          </div>

          <div className="mt-6">
            <BookingConfirmation
              isSubmitting={isSubmitting}
              onCancel={() => onOpenChange(false)}
              onConfirm={handleSubmit}
              isValid={isValid}
              googleAuthError={false}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
