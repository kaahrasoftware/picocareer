
import { useState } from 'react';
import { useTokenOperations } from './useTokenOperations';
import { useWalletBalance } from './useWalletBalance';
import { useBookSession } from './useBookSession';
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

export function useSessionPayment() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { deductTokens, refundTokens } = useTokenOperations();
  const { wallet } = useWalletBalance();
  const bookSession = useBookSession();

  const processPaymentAndBooking = async (params: SessionPaymentParams) => {
    const { mentorId, mentorName, menteeName, formData, onSuccess, onError } = params;
    
    if (!formData.date || !formData.selectedTime || !formData.sessionType) {
      const error = new Error('Please select a date, time and session type');
      onError(error);
      return;
    }

    if (!wallet) {
      const error = new Error('Wallet not found');
      onError(error);
      return;
    }

    if (wallet.balance < 25) {
      const error = new Error('Insufficient tokens. You need 25 tokens to book a session.');
      onError(error);
      return;
    }

    setIsProcessing(true);
    let transactionId: string | null = null;

    try {
      console.log('Step 1: Deducting tokens first...');
      
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
        throw new Error(tokenResult.message || 'Failed to deduct tokens');
      }

      transactionId = tokenResult.transaction_id;
      console.log('Tokens deducted successfully, transaction ID:', transactionId);

      console.log('Step 2: Booking session...');
      
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
        console.error('Session booking failed, rolling back tokens...');
        
        // Rollback: Refund the tokens
        try {
          await refundTokens.mutateAsync({
            walletId: wallet.id,
            amount: 25,
            description: `Refund for failed session booking with ${mentorName}`,
            referenceId: transactionId,
            metadata: {
              original_transaction_id: transactionId,
              refund_reason: 'Session booking failed',
              mentor_name: mentorName
            }
          });
          console.log('Tokens refunded successfully');
        } catch (refundError) {
          console.error('Failed to refund tokens:', refundError);
          throw new Error('Session booking failed and token refund also failed. Please contact support.');
        }
        
        throw new Error(bookingResult.error || 'Failed to book session');
      }

      console.log('Session booked successfully:', bookingResult.sessionId);
      
      // Update the metadata of the original transaction with the session ID
      try {
        // Note: We could add a function to update transaction metadata, but for now we'll proceed
        console.log('Session booking completed successfully');
      } catch (updateError) {
        console.warn('Failed to update transaction metadata, but session was booked successfully');
      }

      toast.success(`Session booked successfully with ${mentorName}! 25 tokens have been deducted from your wallet.`);
      onSuccess();
    } catch (error: any) {
      console.error('Error in session payment process:', error);
      
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
