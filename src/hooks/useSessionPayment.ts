
import { useState } from 'react';
import { useSessionBooking } from './useSessionBooking';
import { MeetingPlatform } from '@/types/calendar';

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
  const handleSessionBooking = useSessionBooking();

  const processPaymentAndBooking = async (params: SessionPaymentParams) => {
    setIsProcessing(true);
    
    try {
      console.log('Processing payment and booking...', params);
      
      await handleSessionBooking({
        ...params,
        onSuccess: () => {
          setIsProcessing(false);
          params.onSuccess();
        },
        onError: (error) => {
          setIsProcessing(false);
          params.onError(error);
        }
      });
    } catch (error) {
      console.error('Session booking failed:', error);
      setIsProcessing(false);
      params.onError(error);
    }
  };

  return {
    processPaymentAndBooking,
    isProcessing
  };
}
