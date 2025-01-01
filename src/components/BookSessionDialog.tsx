import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BookingForm } from "./booking/BookingForm";
import { BookingConfirmation } from "./booking/BookingConfirmation";
import { useBookSession } from "@/hooks/useBookSession";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuthSession } from "@/hooks/useAuthSession";
import { MeetingPlatform } from "@/types/calendar";

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
  }>({
    note: "",
    meetingPlatform: "Google Meet"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);
  const bookSession = useBookSession();

  const handleSubmit = async () => {
    if (!formData.date || !formData.selectedTime || !formData.sessionType || !mentor.id) return;
    
    setIsSubmitting(true);
    
    try {
      console.log('Booking session with:', formData);
      
      const sessionResult = await bookSession({
        mentorId: mentor.id,
        date: formData.date,
        selectedTime: formData.selectedTime,
        sessionTypeId: formData.sessionType,
        note: formData.note,
        meetingPlatform: formData.meetingPlatform,
      });

      if (!sessionResult.success) {
        throw new Error(sessionResult.error || 'Failed to book session');
      }

      console.log('Session booked successfully, creating meet link...');

      if (formData.meetingPlatform === 'Google Meet') {
        try {
          console.log('Invoking create-meet-link function for session:', sessionResult.sessionId);
          
          const { data: meetData, error: meetError } = await supabase.functions.invoke('create-meet-link', {
            body: { 
              sessionId: sessionResult.sessionId 
            }
          });

          if (meetError) {
            console.error('Error creating meet link:', meetError);
            throw meetError;
          }

          console.log('Meet link created successfully:', meetData);

        } catch (meetError: any) {
          console.error('Detailed error creating meet link:', meetError);
          throw new Error(`Failed to create Google Meet link: ${meetError.message}`);
        }
      }

      try {
        console.log('Setting up notifications and sending emails...');
        
        await Promise.all([
          supabase.functions.invoke('schedule-session-notifications', {
            body: { sessionId: sessionResult.sessionId }
          }),
          supabase.functions.invoke('send-session-email', {
            body: { 
              sessionId: sessionResult.sessionId,
              type: 'confirmation'
            }
          })
        ]);

        console.log('Notifications and emails sent successfully');
      } catch (notificationError) {
        console.error('Error with notifications/emails:', notificationError);
        toast({
          title: "Session Booked",
          description: "Session booked successfully, but there was an issue sending notifications.",
          variant: "destructive"
        });
      }

      toast({
        title: "Session Booked",
        description: "Session booked successfully! Check your email for confirmation details.",
        variant: "default"
      });

      onOpenChange(false);
    } catch (error: any) {
      console.error('Detailed booking error:', error);
      toast({
        title: "Booking Error",
        description: error.message || "Failed to book session. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = !!formData.date && !!formData.selectedTime && !!formData.sessionType && !!mentor.id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Book a Session with {mentor.name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BookingForm 
            mentorId={mentor.id}
            onFormChange={setFormData}
          />
        </div>

        <BookingConfirmation
          isSubmitting={isSubmitting}
          onCancel={() => onOpenChange(false)}
          onConfirm={handleSubmit}
          isValid={isValid}
          googleAuthError={false}
        />
      </DialogContent>
    </Dialog>
  );
}