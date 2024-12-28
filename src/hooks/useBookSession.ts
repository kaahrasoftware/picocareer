import { supabase } from "@/integrations/supabase/client";

type MeetingPlatform = "google_meet" | "whatsapp" | "telegram";

interface BookSessionParams {
  mentorId: string;
  date: Date;
  selectedTime: string;
  sessionTypeId: string;
  note: string;
  meetingPlatform: MeetingPlatform;
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
    meetingPlatform 
  }: BookSessionParams): Promise<BookSessionResult> => {
    if (!date || !selectedTime || !sessionTypeId || !mentorId) {
      return { success: false, error: "Missing required fields" };
    }

    const scheduledAt = new Date(date);
    const [hours, minutes] = selectedTime.split(':');
    scheduledAt.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    try {
      // First, get the user's timezone from settings
      const { data: user } = await supabase.auth.getUser();
      const { data: userSettings } = await supabase
        .from('user_settings')
        .select('setting_value')
        .eq('profile_id', user.user?.id)
        .eq('setting_type', 'timezone')
        .single();

      // Use the user's timezone or UTC as fallback
      const userTimezone = userSettings?.setting_value || 'UTC';

      const { data: session, error } = await supabase
        .from('mentor_sessions')
        .insert({
          mentor_id: mentorId,
          mentee_id: user.user?.id,
          session_type_id: sessionTypeId,
          scheduled_at: scheduledAt.toISOString(),
          notes: note,
          meeting_platform: meetingPlatform,
          timezone: userTimezone, // Set the timezone from user settings
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