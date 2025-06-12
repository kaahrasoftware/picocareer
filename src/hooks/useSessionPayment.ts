
import { useState } from 'react';
import { useTokenOperations } from './useTokenOperations';
import { useWalletBalance } from './useWalletBalance';
import { useBookSession } from './useBookSession';
import { MeetingPlatform } from '@/types/calendar';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { notifyAdmins } from '@/components/booking/AdminNotification';

interface SessionPaymentParams {
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

export function useSessionPayment() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { deductTokens, refundTokens } = useTokenOperations();
  const { wallet } = useWalletBalance();
  const bookSession = useBookSession();

  const processPaymentAndBooking = async (params: SessionPaymentParams) => {
    const { mentorId, mentorName, menteeName, formData, onSuccess, onError } = params;
    
    console.log('🚀 Starting session payment and booking process...');
    console.log('📋 Payment params:', { mentorId, mentorName, menteeName });
    console.log('📋 Form data:', formData);
    console.log('💰 Wallet info:', wallet);
    
    if (!formData.date || !formData.selectedTime || !formData.sessionType) {
      const error = new Error('Please select a date, time and session type');
      console.error('❌ Missing required form data:', { date: formData.date, time: formData.selectedTime, sessionType: formData.sessionType });
      onError(error);
      return;
    }

    if (!wallet) {
      const error = new Error('Wallet not found');
      console.error('❌ No wallet found for user');
      onError(error);
      return;
    }

    if (wallet.balance < 25) {
      const error = new Error('Insufficient tokens. You need 25 tokens to book a session.');
      console.error('❌ Insufficient balance:', wallet.balance);
      toast.error('Insufficient tokens. You need 25 tokens to book a session.');
      onError(error);
      return;
    }

    setIsProcessing(true);
    let transactionId: string | null = null;
    let sessionId: string | null = null;

    try {
      console.log('💳 Step 1: Deducting 25 tokens...');
      
      // Step 1: Deduct tokens first
      const tokenResult = await deductTokens.mutateAsync({
        walletId: wallet.id,
        amount: 25,
        description: `Session booking with ${mentorName}`,
        category: 'session',
        metadata: {
          mentor_name: mentorName,
          mentee_name: menteeName,
          session_date: formData.date.toISOString(),
          session_time: formData.selectedTime,
          meeting_platform: formData.meetingPlatform
        }
      });

      if (!tokenResult.success) {
        console.error('❌ Token deduction failed:', tokenResult.message);
        throw new Error(tokenResult.message || 'Failed to deduct tokens');
      }

      transactionId = tokenResult.transaction_id;
      console.log('✅ Tokens deducted successfully, transaction ID:', transactionId);

      console.log('📅 Step 2: Booking session...');
      
      // Step 2: Book the session
      const bookingResult = await bookSession({
        mentorId,
        date: formData.date,
        selectedTime: formData.selectedTime,
        sessionTypeId: formData.sessionType,
        note: formData.note,
        meetingPlatform: formData.meetingPlatform,
        menteePhoneNumber: formData.menteePhoneNumber,
        menteeTelegramUsername: formData.menteeTelegramUsername,
      });

      if (!bookingResult.success) {
        console.error('❌ Session booking failed, rolling back tokens...');
        
        // Rollback: Refund the tokens
        try {
          const refundResult = await refundTokens.mutateAsync({
            walletId: wallet.id,
            amount: 25,
            description: `Refund for failed session booking with ${mentorName}`,
            referenceId: transactionId,
            metadata: {
              original_transaction_id: transactionId,
              refund_reason: 'Session booking failed',
              mentor_name: mentorName,
              error_details: bookingResult.error
            }
          });
          
          if (refundResult.success) {
            console.log('✅ Tokens refunded successfully');
            toast.info('Tokens have been refunded due to booking failure.');
          } else {
            console.error('❌ Token refund failed:', refundResult.message);
            toast.error('Session booking failed and token refund also failed. Please contact support.');
          }
        } catch (refundError) {
          console.error('❌ Failed to refund tokens:', refundError);
          toast.error('Session booking failed and token refund also failed. Please contact support.');
          throw new Error('Session booking failed and token refund also failed. Please contact support.');
        }
        
        throw new Error(bookingResult.error || 'Failed to book session');
      }

      sessionId = bookingResult.sessionId;
      console.log('✅ Session booked successfully with ID:', sessionId);

      // Step 3: Create notifications and send emails
      console.log('📧 Step 3: Creating notifications and sending emails...');
      
      // Get current user for notifications
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('❌ Could not get current user for notifications:', userError);
        // Don't fail the entire booking for notification issues
        console.warn('⚠️ Continuing without notifications due to user auth issue');
      } else {
        // Create notifications for both mentor and mentee
        try {
          console.log('📤 Creating in-app notifications...');
          
          // Create notification for mentor
          const mentorNotificationData = {
            profile_id: mentorId,
            title: "New Session Booking",
            message: `${menteeName} has booked a session with you for ${formData.date.toLocaleDateString()} at ${formData.selectedTime}`,
            type: "session_booked" as const,
            category: "mentorship" as const,
            action_url: `/sessions/${sessionId}`
          };

          const { error: mentorNotificationError } = await supabase
            .from('notifications')
            .insert(mentorNotificationData);

          if (mentorNotificationError) {
            console.error('❌ Mentor notification failed:', mentorNotificationError);
          } else {
            console.log('✅ Mentor notification created successfully');
          }

          // Create notification for mentee
          const menteeNotificationData = {
            profile_id: user.id,
            title: "Session Booking Confirmed",
            message: `Your session with ${mentorName} has been confirmed for ${formData.date.toLocaleDateString()} at ${formData.selectedTime}`,
            type: "session_booked" as const,
            category: "mentorship" as const,
            action_url: `/sessions/${sessionId}`
          };

          const { error: menteeNotificationError } = await supabase
            .from('notifications')
            .insert(menteeNotificationData);

          if (menteeNotificationError) {
            console.error('❌ Mentee notification failed:', menteeNotificationError);
          } else {
            console.log('✅ Mentee notification created successfully');
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
          } catch (error: any) {
            console.error('❌ Admin notification failed:', error);
          }

        } catch (notificationError) {
          console.error('❌ Error creating notifications:', notificationError);
          // Don't fail the booking for notification issues
        }

        // Send email confirmations
        try {
          console.log('📧 Sending email confirmations...');
          
          // Send email to mentor
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
          } else {
            console.log('✅ Mentor email sent successfully');
          }

          // Send email to mentee
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
          } else {
            console.log('✅ Mentee email sent successfully');
          }

        } catch (emailError) {
          console.error('❌ Error sending emails:', emailError);
          // Don't fail the booking for email issues
        }
      }

      console.log('🎉 Session booking process completed successfully!');
      
      toast.success(`Session booked successfully with ${mentorName}! 25 tokens have been deducted from your wallet.`);
      onSuccess();
      
    } catch (error: any) {
      console.error('💥 Error in session payment process:', error);
      
      // Provide specific error messages
      if (error.message.includes('Insufficient token balance')) {
        toast.error('Insufficient tokens. You need 25 tokens to book a session.');
      } else if (error.message.includes('Time slot is already booked')) {
        toast.error('This time slot is no longer available. Please select a different time.');
      } else if (error.message.includes('token')) {
        toast.error(error.message);
      } else {
        toast.error(error.message || 'Failed to book session. Please try again.');
      }
      
      onError(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processPaymentAndBooking,
    isProcessing
  };
}
