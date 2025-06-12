
import { useBookSession } from "@/hooks/useBookSession";
import { supabase } from "@/integrations/supabase/client";
import { MeetingPlatform } from "@/types/calendar";
import { notifyAdmins } from "./AdminNotification";

interface SessionBookingParams {
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
  onError: (error: any) => void;
}

export function useSessionBookingDebug() {
  const bookSession = useBookSession();

  const handleSessionBooking = async (params: SessionBookingParams) => {
    const { mentorId, mentorName, menteeName, formData, onSuccess, onError } = params;
    
    console.log('🔄 Starting enhanced session booking with debug logging...');
    console.log('📋 Booking parameters:', { mentorId, mentorName, menteeName, formData });

    if (!formData.date || !formData.selectedTime || !formData.sessionType) {
      const error = new Error('Missing required booking parameters');
      console.error('❌ Missing booking parameters:', { date: formData.date, time: formData.selectedTime, sessionType: formData.sessionType });
      onError(error);
      return;
    }

    try {
      console.log('📅 Step 1: Booking session...');
      
      // Book the session
      const bookingResult = await bookSession({
        mentorId,
        date: formData.date,
        selectedTime: formData.selectedTime,
        sessionTypeId: formData.sessionType,
        note: formData.note,
        meetingPlatform: formData.meetingPlatform,
        menteePhoneNumber: formData.menteePhoneNumber,
        menteeTelegramUsername: formData.menteeTelegramUsername
      });

      if (!bookingResult.success) {
        console.error('❌ Session booking failed:', bookingResult.error);
        throw new Error(bookingResult.error || 'Failed to book session');
      }

      const sessionId = bookingResult.sessionId;
      console.log('✅ Session booked successfully with ID:', sessionId);

      console.log('📧 Step 2: Starting enhanced notification process...');
      
      // Get current user for notifications
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('❌ Could not get current user for notifications:', userError);
        throw new Error('User authentication failed');
      }

      console.log('👤 Current user ID:', user.id);

      // Initialize notification status tracking
      const notificationStatus = {
        mentorNotification: { status: 'pending', error: null },
        menteeNotification: { status: 'pending', error: null },
        adminNotification: { status: 'pending', error: null },
        mentorEmail: { status: 'pending', error: null },
        menteeEmail: { status: 'pending', error: null }
      };

      console.log('📬 Step 3: Creating in-app notifications...');
      
      // Create notification for mentor
      try {
        const mentorNotificationData = {
          profile_id: mentorId,
          title: "New Session Booking",
          message: `${menteeName} has booked a session with you for ${formData.date.toLocaleDateString()} at ${formData.selectedTime}`,
          type: "session_booked" as const,
          category: "mentorship" as const,
          action_url: `/sessions/${sessionId}`
        };

        console.log('📤 Creating mentor notification with data:', mentorNotificationData);
        
        const { data: mentorNotificationResult, error: mentorNotificationError } = await supabase
          .from('notifications')
          .insert(mentorNotificationData)
          .select('*');

        if (mentorNotificationError) {
          console.error('❌ Mentor notification failed:', mentorNotificationError);
          console.error('❌ Mentor notification error details:', {
            message: mentorNotificationError.message,
            details: mentorNotificationError.details,
            hint: mentorNotificationError.hint,
            code: mentorNotificationError.code
          });
          notificationStatus.mentorNotification = { status: 'failed', error: mentorNotificationError.message };
        } else {
          console.log('✅ Mentor notification created successfully:', mentorNotificationResult);
          notificationStatus.mentorNotification = { status: 'success', error: null };
        }
      } catch (error: any) {
        console.error('❌ Exception creating mentor notification:', error);
        notificationStatus.mentorNotification = { status: 'failed', error: error.message };
      }

      // Create notification for mentee
      try {
        const menteeNotificationData = {
          profile_id: user.id,
          title: "Session Booking Confirmed",
          message: `Your session with ${mentorName} has been confirmed for ${formData.date.toLocaleDateString()} at ${formData.selectedTime}`,
          type: "session_booked" as const,
          category: "mentorship" as const,
          action_url: `/sessions/${sessionId}`
        };

        console.log('📤 Creating mentee notification with data:', menteeNotificationData);

        const { data: menteeNotificationResult, error: menteeNotificationError } = await supabase
          .from('notifications')
          .insert(menteeNotificationData)
          .select('*');

        if (menteeNotificationError) {
          console.error('❌ Mentee notification failed:', menteeNotificationError);
          console.error('❌ Mentee notification error details:', {
            message: menteeNotificationError.message,
            details: menteeNotificationError.details,
            hint: menteeNotificationError.hint,
            code: menteeNotificationError.code
          });
          notificationStatus.menteeNotification = { status: 'failed', error: menteeNotificationError.message };
        } else {
          console.log('✅ Mentee notification created successfully:', menteeNotificationResult);
          notificationStatus.menteeNotification = { status: 'success', error: null };
        }
      } catch (error: any) {
        console.error('❌ Exception creating mentee notification:', error);
        notificationStatus.menteeNotification = { status: 'failed', error: error.message };
      }

      // Notify admins
      try {
        await notifyAdmins({
          mentorName,
          menteeName,
          sessionType: formData.sessionType,
          scheduledAt: formData.date
        });
        console.log('✅ Admin notifications sent successfully');
        notificationStatus.adminNotification = { status: 'success', error: null };
      } catch (error: any) {
        console.error('❌ Admin notification failed:', error);
        notificationStatus.adminNotification = { status: 'failed', error: error.message };
      }

      console.log('📧 Step 4: Sending email confirmations...');
      
      // Send email to mentor
      try {
        console.log('📤 Sending mentor email confirmation...');
        const { error: mentorEmailError } = await supabase.functions.invoke('send-session-confirmation', {
          body: {
            type: 'mentor',
            sessionId: sessionId,
            recipientId: mentorId,
            sessionDetails: {
              menteeName,
              date: formData.date.toISOString(),
              time: formData.selectedTime,
              meetingPlatform: formData.meetingPlatform,
              note: formData.note
            }
          }
        });

        if (mentorEmailError) {
          console.error('❌ Mentor email failed:', mentorEmailError);
          notificationStatus.mentorEmail = { status: 'failed', error: mentorEmailError.message };
        } else {
          console.log('✅ Mentor email sent successfully');
          notificationStatus.mentorEmail = { status: 'success', error: null };
        }
      } catch (error: any) {
        console.error('❌ Exception sending mentor email:', error);
        notificationStatus.mentorEmail = { status: 'failed', error: error.message };
      }

      // Send email to mentee
      try {
        console.log('📤 Sending mentee email confirmation...');
        const { error: menteeEmailError } = await supabase.functions.invoke('send-session-confirmation', {
          body: {
            type: 'mentee',
            sessionId: sessionId,
            recipientId: user.id,
            sessionDetails: {
              mentorName,
              date: formData.date.toISOString(),
              time: formData.selectedTime,
              meetingPlatform: formData.meetingPlatform,
              note: formData.note
            }
          }
        });

        if (menteeEmailError) {
          console.error('❌ Mentee email failed:', menteeEmailError);
          notificationStatus.menteeEmail = { status: 'failed', error: menteeEmailError.message };
        } else {
          console.log('✅ Mentee email sent successfully');
          notificationStatus.menteeEmail = { status: 'success', error: null };
        }
      } catch (error: any) {
        console.error('❌ Exception sending mentee email:', error);
        notificationStatus.menteeEmail = { status: 'failed', error: error.message };
      }

      console.log('📊 Final notification status:', notificationStatus);
      
      // Check if any critical notifications failed
      const criticalFailures = [
        notificationStatus.mentorNotification.status === 'failed',
        notificationStatus.menteeNotification.status === 'failed'
      ].filter(Boolean);

      if (criticalFailures.length > 0) {
        console.warn('⚠️ Some notifications failed, but session was booked successfully');
        console.warn('⚠️ Critical notification failures:', {
          mentorFailed: notificationStatus.mentorNotification.status === 'failed',
          menteeFailed: notificationStatus.menteeNotification.status === 'failed'
        });
      }

      console.log('🎉 Session booking process completed!');
      onSuccess();
      
    } catch (error: any) {
      console.error('💥 Error in session booking process:', error);
      onError(error);
    }
  };

  return handleSessionBooking;
}
