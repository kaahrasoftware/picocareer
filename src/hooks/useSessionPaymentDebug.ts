
import { useState } from 'react';
import { useTokenOperations } from './useTokenOperations';
import { useWalletBalance } from './useWalletBalance';
import { useSessionBookingDebug } from '@/components/booking/SessionBookingHandlerDebug';
import { MeetingPlatform } from '@/types/calendar';
import { toast } from 'sonner';

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

export function useSessionPaymentDebug() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { deductTokens, refundTokens } = useTokenOperations();
  const { wallet } = useWalletBalance();
  const handleSessionBooking = useSessionBookingDebug();

  const processPaymentAndBooking = async (params: SessionPaymentParams) => {
    const { mentorId, mentorName, menteeName, formData, onSuccess, onError } = params;
    
    console.log('🚀 Starting session payment and booking process with enhanced debug logging...');
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
    let bookingSucceeded = false;

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

      console.log('📅 Step 2: Attempting to book session with enhanced debug notification handling...');
      
      // Step 2: Book the session using the enhanced debug booking handler
      try {
        await new Promise<void>((resolve, reject) => {
          handleSessionBooking({
            mentorId,
            mentorName,
            menteeName,
            formData,
            onSuccess: () => {
              console.log('✅ Debug: Session booking handler reported success');
              bookingSucceeded = true;
              resolve();
            },
            onError: (bookingError) => {
              console.error('❌ Debug: Session booking handler reported error:', bookingError);
              reject(bookingError);
            }
          });
        });

        console.log('✅ Session booking completed successfully with debug notifications');

      } catch (bookingError: any) {
        console.error('❌ Session booking failed, details:', bookingError);
        
        // Rollback: Refund the tokens
        console.log('🔄 Rolling back token deduction...');
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
              error_details: bookingError.message
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
        
        throw new Error(bookingError.message || 'Failed to book session');
      }

      console.log('🎉 Session booking process completed successfully with debug notifications!');
      
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
