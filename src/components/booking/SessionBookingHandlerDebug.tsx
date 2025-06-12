
import { MeetingPlatform } from "@/types/calendar";
import { useBookSession } from "@/hooks/useBookSession";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { notifyAdmins } from "./AdminNotification";
import { toast } from "sonner";

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

export function useSessionBookingDebug() {
  const bookSession = useBookSession();
  const { toast: uiToast } = useToast();

  const handleSessionBooking = async ({
    mentorId,
    mentorName,
    menteeName,
    formData,
    onSuccess,
    onError
  }: SessionBookingHandlerProps) => {
    let sessionId: string | null = null;
    const notificationResults = {
      admins: false,
      meetLink: false,
      notifications: false,
      email: false
    };

    try {
      console.log('🚀 Starting session booking process with debug...', {
        mentorId,
        date: formData.date,
        time: formData.selectedTime,
        sessionType: formData.sessionType,
        platform: formData.meetingPlatform,
        menteePhoneNumber: formData.menteePhoneNumber,
        menteeTelegramUsername: formData.menteeTelegramUsername
      });
      
      const sessionResult = await bookSession({
        mentorId,
        date: formData.date!,
        selectedTime: formData.selectedTime!,
        sessionTypeId: formData.sessionType!,
        note: formData.note,
        meetingPlatform: formData.meetingPlatform,
        menteePhoneNumber: formData.menteePhoneNumber,
        menteeTelegramUsername: formData.menteeTelegramUsername,
      });

      if (!sessionResult.success) {
        throw new Error(sessionResult.error || 'Failed to book session');
      }

      sessionId = sessionResult.sessionId!;
      console.log('✅ Session booked successfully with ID:', sessionId);

      // Phase 1: Notify admins
      try {
        console.log('📢 Attempting to notify admins...');
        await notifyAdmins({
          mentorName,
          menteeName,
          sessionType: "Session", // Generic type for now
          scheduledAt: formData.date
        });
        console.log('✅ Admin notifications sent successfully');
        notificationResults.admins = true;
      } catch (adminError: any) {
        console.error('❌ Failed to notify admins:', adminError);
        toast.error('Admin notification failed but session was booked');
      }

      // Phase 2: Create Google Meet link if needed
      if (formData.meetingPlatform === 'Google Meet') {
        try {
          console.log('🔗 Creating Google Meet link...');
          const { data: meetData, error: meetError } = await supabase.functions.invoke('create-meet-link', {
            body: { 
              sessionId: sessionId 
            }
          });

          if (meetError) {
            console.error('❌ Meet link error:', meetError);
            throw meetError;
          }

          if (!meetData?.meetLink) {
            throw new Error('Failed to generate Google Meet link');
          }

          // Update session with meet link
          const { error: updateError } = await supabase
            .from('mentor_sessions')
            .update({ meeting_link: meetData.meetLink })
            .eq('id', sessionId);

          if (updateError) {
            console.error('❌ Failed to update session with meet link:', updateError);
            throw updateError;
          }

          console.log('✅ Google Meet link created and saved');
          notificationResults.meetLink = true;
        } catch (meetLinkError: any) {
          console.error('❌ Meet link creation failed:', meetLinkError);
          toast.error('Session booked but Google Meet link creation failed');
        }
      } else {
        notificationResults.meetLink = true; // Not applicable
      }

      // Phase 3: Send notifications and emails
      const notificationPromises = [];
      
      // Schedule session notifications
      console.log('🔔 Scheduling session notifications...');
      notificationPromises.push(
        supabase.functions.invoke('schedule-session-notifications', {
          body: { sessionId: sessionId }
        }).then(result => {
          if (result.error) {
            console.error('❌ Notification scheduling failed:', result.error);
            throw result.error;
          }
          console.log('✅ Session notifications scheduled');
          notificationResults.notifications = true;
          return result;
        }).catch(error => {
          console.error('❌ Failed to schedule notifications:', error);
          throw error;
        })
      );

      // Send confirmation email
      console.log('📧 Sending confirmation email...');
      notificationPromises.push(
        supabase.functions.invoke('send-session-email', {
          body: { 
            sessionId: sessionId,
            type: 'confirmation'
          }
        }).then(result => {
          if (result.error) {
            console.error('❌ Email sending failed:', result.error);
            throw result.error;
          }
          console.log('✅ Confirmation email sent');
          notificationResults.email = true;
          return result;
        }).catch(error => {
          console.error('❌ Failed to send email:', error);
          throw error;
        })
      );

      // Wait for all notifications to complete
      try {
        const results = await Promise.allSettled(notificationPromises);
        
        const failedNotifications = results.filter(result => result.status === 'rejected');
        
        if (failedNotifications.length > 0) {
          console.warn('⚠️ Some notifications failed:', failedNotifications);
          toast.error(`Session booked successfully, but ${failedNotifications.length} notification(s) failed`);
        } else {
          console.log('✅ All notifications sent successfully');
        }
      } catch (notificationError: any) {
        console.error('❌ Notification batch failed:', notificationError);
        toast.error('Session booked but some notifications may have failed');
      }

      // Show detailed success message
      const successParts = [];
      if (notificationResults.admins) successParts.push('admins notified');
      if (notificationResults.meetLink && formData.meetingPlatform === 'Google Meet') successParts.push('meeting link created');
      if (notificationResults.notifications) successParts.push('notifications sent');
      if (notificationResults.email) successParts.push('emails sent');

      const successMessage = successParts.length > 0 
        ? `Session booked successfully! ${successParts.join(', ')}.`
        : 'Session booked successfully! Check your email for confirmation details.';

      uiToast({
        title: "Session Booked Successfully",
        description: successMessage,
        variant: "default"
      });

      // Also show detailed debug info
      console.log('📊 Notification Results Summary:', notificationResults);
      toast.success(`Debug: ${JSON.stringify(notificationResults)}`);

      onSuccess();
    } catch (error: any) {
      console.error('💥 Booking error:', error);
      
      // If we have a session ID but notifications failed, still show partial success
      if (sessionId) {
        toast.error('Session was created but notifications failed. Please contact support if you don\'t receive confirmation.');
        onSuccess(); // Still call success since session was created
      } else {
        onError(error);
      }
    }
  };

  return handleSessionBooking;
}
