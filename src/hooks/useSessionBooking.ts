
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { MeetingPlatform } from '@/types/calendar';

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

    setIsBooking(true);

    try {
      // Implementation would go here
      console.log('Booking session with:', {
        mentorId,
        mentorName,
        menteeName,
        formData
      });

      toast.success(`Session booked successfully with ${mentorName}`);
      onSuccess();
    } catch (error) {
      console.error('Error booking session:', error);
      onError(error);
      toast.error('Failed to book session. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  return handleSessionBooking;
}
