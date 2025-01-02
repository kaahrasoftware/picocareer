import { supabase } from "@/integrations/supabase/client";
import { MeetingPlatform } from "@/types/calendar";

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
      const { data: session, error } = await supabase
        .from('mentor_sessions')
        .insert({
          mentor_id: mentorId,
          mentee_id: (await supabase.auth.getUser()).data.user?.id,
          session_type_id: sessionTypeId,
          scheduled_at: scheduledAt.toISOString(),
          notes: note,
          meeting_platform: meetingPlatform,
          mentee_phone_number: menteePhoneNumber,
          mentee_telegram_username: menteeTelegramUsername,
        })
        .select()
        .single();

      if (error) throw error;

      return { 
        success: true, 
        sessionId: session.id 
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