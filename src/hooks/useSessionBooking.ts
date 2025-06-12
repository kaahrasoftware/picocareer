
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { MeetingPlatform } from '@/types/calendar';
import { useBookSession } from './useBookSession';
import { useTokenOperations } from './useTokenOperations';
import { useWalletBalance } from './useWalletBalance';

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

export function useSessionBooking() {
  const [isBooking, setIsBooking] = useState(false);
  const bookSession = useBookSession();
  const { deductTokens } = useTokenOperations();
  const { wallet } = useWalletBalance();

  const handleSessionBooking = async ({
    mentorId,
    mentorName,
    menteeName,
    formData,
    onSuccess,
    onError
  }: SessionBookingParams) => {
    if (!formData.date || !formData.selectedTime || !formData.sessionType) {
      const error = new Error('Please select a date, time and session type');
      toast.error(error.message);
      onError(error);
      return;
    }

    if (!wallet) {
      const error = new Error('Wallet not found');
      toast.error(error.message);
      onError(error);
      return;
    }

    if (wallet.balance < 25) {
      const error = new Error('Insufficient tokens. You need 25 tokens to book a session.');
      toast.error(error.message);
      onError(error);
      return;
    }

    setIsBooking(true);

    try {
      console.log('Starting session booking process...', {
        mentorId,
        mentorName,
        date: formData.date,
        time: formData.selectedTime,
        sessionType: formData.sessionType,
        platform: formData.meetingPlatform
      });

      // First, attempt to book the session
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

      console.log('Booking result:', bookingResult);

      if (!bookingResult.success) {
        throw new Error(bookingResult.error || 'Failed to book session');
      }

      console.log('Session booked successfully, now deducting tokens...');

      // Only deduct tokens after successful booking
      const tokenResult = await deductTokens.mutateAsync({
        walletId: wallet.id,
        amount: 25,
        description: `Mentor session with ${mentorName}`,
        category: 'session',
        referenceId: bookingResult.sessionId,
        metadata: {
          mentor_name: mentorName,
          session_id: bookingResult.sessionId,
          session_date: formData.date.toISOString(),
          session_time: formData.selectedTime,
          meeting_platform: formData.meetingPlatform
        }
      });

      console.log('Token deduction result:', tokenResult);

      if (!tokenResult.success) {
        // If token deduction fails, we should try to cancel the booking
        console.error('Token deduction failed, attempting to cancel booking...');
        
        try {
          await supabase
            .from('mentor_sessions')
            .delete()
            .eq('id', bookingResult.sessionId);
          
          throw new Error('Token deduction failed. Booking has been cancelled.');
        } catch (cancelError) {
          console.error('Failed to cancel booking:', cancelError);
          throw new Error('Token deduction failed and booking could not be cancelled. Please contact support.');
        }
      }

      console.log('Tokens deducted successfully');
      toast.success(`Session booked successfully with ${mentorName}! 25 tokens have been deducted from your wallet.`);
      onSuccess();
    } catch (error: any) {
      console.error('Error in session booking process:', error);
      
      // Provide specific error messages
      if (error.message.includes('create_session_and_update_availability')) {
        toast.error('Session booking service is temporarily unavailable. Please try again later.');
      } else if (error.message.includes('token')) {
        toast.error(error.message);
      } else if (error.message.includes('Time slot is already booked')) {
        toast.error('This time slot is no longer available. Please select a different time.');
      } else {
        toast.error(error.message || 'Failed to book session. Please try again.');
      }
      
      onError(error);
    } finally {
      setIsBooking(false);
    }
  };

  return handleSessionBooking;
}
