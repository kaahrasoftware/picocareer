
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { notifyAdmins } from "./booking/AdminNotification";
import type { Database } from "@/types/database/database.types";

interface BookSessionDialogProps {
  mentor: {
    id: string;
    name: string;
    imageUrl: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SessionType = Database['public']['Tables']['mentor_session_types']['Row'];
type MentorSession = Database['public']['Tables']['mentor_sessions']['Row'];

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
  const bookSession = useBookSession();

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
      console.log('Starting session booking process...', {
        mentorId: mentor.id,
        date: formData.date,
        time: formData.selectedTime,
        sessionType: formData.sessionType,
        platform: formData.meetingPlatform,
        menteePhoneNumber: formData.menteePhoneNumber,
        menteeTelegramUsername: formData.menteeTelegramUsername
      });
      
      const sessionResult = await bookSession({
        mentorId: mentor.id,
        date: formData.date,
        selectedTime: formData.selectedTime,
        sessionTypeId: formData.sessionType,
        note: formData.note,
        meetingPlatform: formData.meetingPlatform,
        menteePhoneNumber: formData.menteePhoneNumber,
        menteeTelegramUsername: formData.menteeTelegramUsername,
      });

      if (!sessionResult.success) {
        console.error('Session booking failed:', sessionResult.error);
        throw new Error(sessionResult.error || 'Failed to book session');
      }

      console.log('Session booked successfully:', sessionResult);

      // Notify admins about the new session booking
      const { data: sessionType } = await supabase
        .from<'mentor_session_types', SessionType>('mentor_session_types')
        .select('type')
        .eq('id', formData.sessionType)
        .single();

      await notifyAdmins({
        mentorName: mentor.name,
        menteeName: profile?.full_name || 'Unknown User',
        sessionType: sessionType?.type || 'Unknown Session Type',
        scheduledAt: formData.date
      });

      if (formData.meetingPlatform === 'Google Meet') {
        console.log('Creating Google Meet link for session:', sessionResult.sessionId);
        
        try {
          const { data: meetData, error: meetError } = await supabase.functions.invoke('create-meet-link', {
            body: { 
              sessionId: sessionResult.sessionId 
            }
          });

          console.log('Meet link creation response:', { data: meetData, error: meetError });

          if (meetError) {
            console.error('Error creating meet link:', meetError);
            throw new Error(`Failed to create Google Meet link: ${meetError.message}`);
          }

          if (!meetData?.meetLink) {
            console.error('No meet link returned:', meetData);
            throw new Error('Failed to generate Google Meet link');
          }

          console.log('Meet link created successfully:', meetData.meetLink);

          // Update session with meet link
          const { error: updateError } = await supabase
            .from<'mentor_sessions', MentorSession>('mentor_sessions')
            .update({ meeting_link: meetData.meetLink })
            .eq('id', sessionResult.sessionId);

          if (updateError) {
            console.error('Error updating session with meet link:', updateError);
            throw new Error('Failed to update session with meet link');
          }

        } catch (meetLinkError: any) {
          console.error('Detailed meet link error:', meetLinkError);
          toast({
            title: "Session Booked",
            description: "Session booked successfully, but there was an issue creating the Google Meet link. The link will be sent to you via email.",
            variant: "destructive"
          });
          // Continue with notifications despite meet link error
        }
      }

      try {
        console.log('Setting up notifications...');
        
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

        console.log('Notifications set up successfully');
      } catch (notificationError) {
        console.error('Error with notifications:', notificationError);
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
      console.error('Booking error:', error);
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
