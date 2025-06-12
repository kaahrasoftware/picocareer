
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
      toast.error('Please select a date, time and session type');
      return;
    }

    if (!wallet) {
      toast.error('Wallet not found');
      return;
    }

    setIsBooking(true);

    try {
      console.log('Starting session booking process...');

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

      if (!bookingResult.success) {
        throw new Error(bookingResult.error || 'Failed to book session');
      }

      console.log('Session booked successfully, now deducting tokens...');

      // Only deduct tokens after successful booking
      await deductTokens.mutateAsync({
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

      console.log('Tokens deducted successfully');
      toast.success(`Session booked successfully with ${mentorName}`);
      onSuccess();
    } catch (error: any) {
      console.error('Error in session booking process:', error);
      
      // If we got here and there was a booking but token deduction failed,
      // we should ideally cancel the booking, but for now we'll just log it
      if (error.message && error.message.includes('token')) {
        toast.error('Session was booked but token deduction failed. Please contact support.');
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
