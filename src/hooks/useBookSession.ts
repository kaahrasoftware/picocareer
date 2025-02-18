
import { supabase } from "@/integrations/supabase/client";
import { MeetingPlatform } from "@/types/calendar";
import { format } from "date-fns";

interface BookSessionParams {
  mentorId: string;
  date: Date;
  selectedTime: string;
  sessionTypeId: string;
  note: string;
  meetingPlatform: MeetingPlatform;
  menteePhoneNumber?: string;
  menteeTelegramUsername?: string;
}

interface BookSessionResult {
  success: boolean;
  sessionId?: string;
  error?: string;
}

export function useBookSession() {
  const bookSession = async ({ 
    mentorId, 
    date, 
    selectedTime, 
    sessionTypeId, 
    note,
    meetingPlatform,
    menteePhoneNumber,
    menteeTelegramUsername
  }: BookSessionParams): Promise<BookSessionResult> => {
    if (!date || !selectedTime || !sessionTypeId || !mentorId) {
      return { success: false, error: "Missing required fields" };
    }

    const scheduledAt = new Date(date);
    const [hours, minutes] = selectedTime.split(':');
    scheduledAt.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    try {
      console.log('Attempting to book session with params:', {
        mentorId,
        date,
        selectedTime,
        sessionTypeId,
        meetingPlatform,
        menteePhoneNumber,
        menteeTelegramUsername
      });

      // First, check if the mentor has any availability for this time
      const { data: availabilityData, error: availabilityError } = await supabase
        .from('mentor_availability')
        .select('*')
        .eq('profile_id', mentorId)
        .eq('is_available', true)
        .is('booked_session_id', null)
        .or(`and(start_date_time.lte.${scheduledAt.toISOString()},end_date_time.gte.${scheduledAt.toISOString()}),and(recurring.eq.true,day_of_week.eq.${scheduledAt.getDay()})`)
        .order('start_date_time', { ascending: true });

      if (availabilityError) {
        console.error('Error checking availability:', availabilityError);
        return { success: false, error: 'Error checking availability' };
      }

      console.log('Available slots found:', availabilityData);

      const { data: sessionData, error: sessionError } = await supabase
        .rpc('create_session_and_update_availability', {
          p_meeting_platform: meetingPlatform,
          p_mentee_id: (await supabase.auth.getUser()).data.user?.id,
          p_mentee_phone_number: menteePhoneNumber || null,
          p_mentee_telegram_username: menteeTelegramUsername || null,
          p_mentor_id: mentorId,
          p_notes: note,
          p_scheduled_at: scheduledAt.toISOString(),
          p_session_date: format(scheduledAt, 'yyyy-MM-dd'),
          p_session_type_id: sessionTypeId,
          p_start_time: format(scheduledAt, 'HH:mm')
        });

      if (sessionError) {
        console.error('Session booking error:', sessionError);
        throw sessionError;
      }

      console.log('Session booked successfully:', sessionData);

      return { 
        success: true, 
        sessionId: sessionData.session_id 
      };
    } catch (error: any) {
      console.error('Error booking session:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  };

  return bookSession;
}
