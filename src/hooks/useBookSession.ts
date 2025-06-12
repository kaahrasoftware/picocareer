
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
    console.log('📅 Starting book session process with params:', {
      mentorId,
      date: date.toISOString(),
      selectedTime,
      sessionTypeId,
      meetingPlatform,
      hasPhoneNumber: !!menteePhoneNumber,
      hasTelegramUsername: !!menteeTelegramUsername
    });

    if (!date || !selectedTime || !sessionTypeId || !mentorId) {
      console.error('❌ Missing required booking fields');
      return { success: false, error: "Missing required fields" };
    }

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('❌ User authentication error:', userError);
      return { success: false, error: "User not authenticated" };
    }

    const menteeId = user.id;
    console.log('👤 Mentee ID:', menteeId);

    const scheduledAt = new Date(date);
    const [hours, minutes] = selectedTime.split(':');
    scheduledAt.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    console.log('⏰ Scheduled time:', scheduledAt.toISOString());

    try {
      // Step 1: Get session type details for duration
      console.log('📋 Getting session type details...');
      const { data: sessionType, error: sessionTypeError } = await supabase
        .from('mentor_session_types')
        .select('duration')
        .eq('id', sessionTypeId)
        .single();

      if (sessionTypeError) {
        console.error('❌ Error fetching session type:', sessionTypeError);
        return { success: false, error: 'Error fetching session type details' };
      }

      console.log('✅ Session type details:', sessionType);
      const endTime = new Date(scheduledAt);
      endTime.setMinutes(endTime.getMinutes() + sessionType.duration);

      // Step 2: Check for existing overlapping bookings
      console.log('🔍 Checking for overlapping bookings...');
      const { data: existingBookings, error: bookingsError } = await supabase
        .from('mentor_sessions')
        .select('scheduled_at, session_type:mentor_session_types(duration)')
        .eq('mentor_id', mentorId)
        .eq('status', 'scheduled')
        .gte('scheduled_at', scheduledAt.toISOString())
        .lte('scheduled_at', endTime.toISOString());

      if (bookingsError) {
        console.error('❌ Error checking existing bookings:', bookingsError);
        return { success: false, error: 'Error checking existing bookings' };
      }

      if (existingBookings?.length > 0) {
        console.log('❌ Found overlapping bookings:', existingBookings);
        return { success: false, error: 'Time slot is already booked' };
      }

      console.log('✅ No overlapping bookings found');

      // Step 3: Check for availability
      console.log('🔍 Checking mentor availability...');
      const { data: availabilityData, error: availabilityError } = await supabase
        .from('mentor_availability')
        .select('*')
        .eq('profile_id', mentorId)
        .eq('is_available', true)
        .is('booked_session_id', null)
        .or(`and(start_date_time.lte.${scheduledAt.toISOString()},end_date_time.gte.${endTime.toISOString()}),and(recurring.eq.true,day_of_week.eq.${scheduledAt.getDay()})`)
        .order('start_date_time', { ascending: true });

      if (availabilityError) {
        console.error('❌ Error checking availability:', availabilityError);
        return { success: false, error: 'Error checking availability' };
      }

      console.log('📅 Available slots found:', availabilityData?.length || 0);
      
      if (!availabilityData || availabilityData.length === 0) {
        console.log('❌ No available slots found');
        return { success: false, error: 'No available slots found for the selected time' };
      }

      // Step 4: Book the session using the RPC function
      console.log('💾 Creating session via RPC...');
      const { data: sessionData, error: sessionError } = await supabase
        .rpc('create_session_and_update_availability', {
          p_meeting_platform: meetingPlatform,
          p_mentee_id: menteeId,
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
        console.error('❌ Session booking RPC error:', sessionError);
        throw sessionError;
      }

      if (!sessionData) {
        console.error('❌ No session data returned from RPC');
        throw new Error('No session data returned');
      }

      const { session_id } = sessionData as { session_id: string };
      
      if (!session_id) {
        console.error('❌ No session ID in returned data:', sessionData);
        throw new Error('No session ID returned');
      }

      console.log('✅ Session created successfully with ID:', session_id);

      return { 
        success: true, 
        sessionId: session_id
      };
      
    } catch (error: any) {
      console.error('💥 Error in bookSession:', error);
      
      // Return specific error messages based on error type
      if (error.message?.includes('Time slot is already booked')) {
        return { success: false, error: 'Time slot is already booked' };
      } else if (error.message?.includes('No available slots')) {
        return { success: false, error: 'No available slots found for the selected time' };
      } else {
        return { 
          success: false, 
          error: error.message || 'Failed to book session'
        };
      }
    }
  };

  return bookSession;
}
