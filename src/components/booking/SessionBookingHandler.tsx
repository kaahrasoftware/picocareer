
import React from 'react';
import { MeetingPlatform } from "@/types/calendar";
import { useBookSession } from "@/hooks/useBookSession";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { notifyAdmins } from "./AdminNotification";

interface SessionBookingHandlerProps {
  mentorId: string;
  mentorName: string;
  menteeName: string;
  formData: {
    date?: Date;
    selectedTime?: string;
    sessionType?: string;
    note: string;
    meetingPlatform: MeetingPlatform;
    menteePhoneNumber?: string;
    menteeTelegramUsername?: string;
  };
  onSuccess: () => void;
  onError: (error: Error) => void;
}

export function useSessionBooking() {
  const bookSession = useBookSession();
  const { toast } = useToast();

  const handleSessionBooking = async ({
    mentorId,
    mentorName,
    menteeName,
    formData,
    onSuccess,
    onError
  }: SessionBookingHandlerProps) => {
    try {
      console.log('Starting session booking process...', {
        mentorId,
        date: formData.date,
        time: formData.selectedTime,
        sessionType: formData.sessionType,
        platform: formData.meetingPlatform,
        menteePhoneNumber: formData.menteePhoneNumber,
        menteeTelegramUsername: formData.menteeTelegramUsername
      });
      
      if (!formData.date || !formData.selectedTime || !formData.sessionType) {
        throw new Error("Missing required session information");
      }
      
      const sessionResult = await bookSession({
        mentorId,
        date: formData.date,
        selectedTime: formData.selectedTime,
        sessionTypeId: formData.sessionType,
        note: formData.note,
        meetingPlatform: formData.meetingPlatform,
        menteePhoneNumber: formData.menteePhoneNumber,
        menteeTelegramUsername: formData.menteeTelegramUsername,
      });

      if (!sessionResult.success) {
        throw new Error(sessionResult.error || 'Failed to book session');
      }

      // Get the session type name for notification
      let sessionTypeName = "Mentoring Session";
      try {
        const { data: sessionType } = await supabase
          .from('mentor_session_types')
          .select('type, custom_type_name')
          .eq('id', formData.sessionType)
          .single();
          
        if (sessionType) {
          sessionTypeName = sessionType.custom_type_name || sessionType.type;
        }
      } catch (error) {
        console.error('Error fetching session type name:', error);
      }

      // Notify admins about the new session booking
      await notifyAdmins({
        mentorName,
        menteeName,
        sessionType: sessionTypeName,
        scheduledAt: formData.date
      });

      if (formData.meetingPlatform === 'Google Meet') {
        try {
          const { data: meetData, error: meetError } = await supabase.functions.invoke('create-meet-link', {
            body: { 
              sessionId: sessionResult.sessionId 
            }
          });

          if (meetError) throw meetError;

          if (!meetData?.meetLink) {
            throw new Error('Failed to generate Google Meet link');
          }

          // Update session with meet link
          const { error: updateError } = await supabase
            .from('mentor_sessions')
            .update({ meeting_link: meetData.meetLink })
            .eq('id', sessionResult.sessionId);

          if (updateError) throw updateError;

        } catch (meetLinkError: any) {
          console.error('Meet link error:', meetLinkError);
          toast({
            title: "Session Booked",
            description: "Session booked successfully, but there was an issue creating the Google Meet link. The link will be sent to you via email.",
            variant: "destructive"
          });
        }
      }

      try {
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
      } catch (notificationError) {
        console.error('Notification error:', notificationError);
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

      onSuccess();
    } catch (error: any) {
      console.error('Booking error:', error);
      onError(error);
    }
  };

  return handleSessionBooking;
}
