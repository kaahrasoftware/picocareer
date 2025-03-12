
import { supabase } from "@/integrations/supabase/client";
import { MeetingPlatform } from "@/types/calendar";
import { format } from "date-fns";
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

interface BookSessionParams {
  mentorId: string;
  date: Date;
  selectedTime: string;
  sessionTypeId: string;
  note: string;
  meetingPlatform: MeetingPlatform;
  menteePhoneNumber?: string;
  menteeTelegramUsername?: string;
  mentorTimezone?: string;
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
    menteeTelegramUsername,
    mentorTimezone = 'UTC'
  }: BookSessionParams): Promise<BookSessionResult> => {
    if (!date || !selectedTime || !sessionTypeId || !mentorId) {
      return { success: false, error: "Missing required fields" };
    }

    // Construct the scheduled time from date and selected time
    // Ensure the time is properly interpreted in the mentor's timezone
    const scheduledAtLocal = new Date(date);
    const [hours, minutes] = selectedTime.split(':');
    scheduledAtLocal.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    // Convert time to mentor's timezone (handles DST correctly)
    const scheduledAtMentorTz = toZonedTime(scheduledAtLocal, mentorTimezone);
    // Then convert to UTC for storage
    const scheduledAt = fromZonedTime(scheduledAtMentorTz, 'UTC');
    
    console.log('Booking session with parameters:', {
      mentorId,
      date: date.toISOString(),
      selectedTime,
      sessionTypeId,
      mentorTimezone,
      scheduledAtLocal: scheduledAtLocal.toISOString(),
      scheduledAtMentorTz: scheduledAtMentorTz.toISOString(),
      scheduledAtUTC: scheduledAt.toISOString(),
    });

    try {
      // Step 1: Get session type details for duration
      const { data: sessionType, error: sessionTypeError } = await supabase
        .from('mentor_session_types')
        .select('duration')
        .eq('id', sessionTypeId)
        .single();

      if (sessionTypeError) {
        console.error('Error fetching session type:', sessionTypeError);
        return { success: false, error: 'Error fetching session type details' };
      }

      const endTime = new Date(scheduledAt);
      endTime.setMinutes(endTime.getMinutes() + sessionType.duration);

      console.log('Session timing:', {
        scheduledAt: scheduledAt.toISOString(),
        endTime: endTime.toISOString(),
        duration: sessionType.duration
      });

      // Step 2: Check for existing bookings
      const { data: existingBookings, error: bookingsError } = await supabase
        .from('mentor_sessions')
        .select('scheduled_at, session_type:mentor_session_types(duration)')
        .eq('mentor_id', mentorId)
        .eq('status', 'scheduled')
        .gte('scheduled_at', scheduledAt.toISOString())
        .lte('scheduled_at', endTime.toISOString());

      if (bookingsError) {
        console.error('Error checking existing bookings:', bookingsError);
        return { success: false, error: 'Error checking existing bookings' };
      }

      if (existingBookings?.length > 0) {
        console.log('Found overlapping bookings:', existingBookings);
        return { success: false, error: 'Time slot is already booked' };
      }

      // Step 3: Check for availability
      // Get current timezone offset for the mentor timezone for DST awareness
      const now = new Date();
      const nowInMentorTz = toZonedTime(now, mentorTimezone);
      const currentOffset = (tzDate(now, mentorTimezone) - tzDate(now, 'UTC')) / (60 * 1000);
      
      console.log('Current mentor timezone offset:', {
        mentorTimezone,
        currentOffset,
        now: now.toISOString(),
        nowInMentorTz: nowInMentorTz.toISOString()
      });

      const { data: availabilityData, error: availabilityError } = await supabase
        .from('mentor_availability')
        .select('*')
        .eq('profile_id', mentorId)
        .eq('is_available', true)
        .is('booked_session_id', null)
        .or(`and(start_date_time.lte.${scheduledAt.toISOString()},end_date_time.gte.${endTime.toISOString()}),and(recurring.eq.true,day_of_week.eq.${scheduledAt.getDay()})`)
        .order('start_date_time', { ascending: true });

      if (availabilityError) {
        console.error('Error checking availability:', availabilityError);
        return { success: false, error: 'Error checking availability' };
      }

      console.log('Available slots found:', availabilityData);
      
      if (!availabilityData || availabilityData.length === 0) {
        return { success: false, error: 'No available slots found for the selected time' };
      }

      let validSlotFound = false;
      let adjustedSlot = null;

      // Process each availability slot to check for DST adjustments
      for (const slot of availabilityData) {
        if (slot.recurring) {
          // For recurring slots, we need to extract the time and apply it to the requested date
          const slotStartTime = new Date(slot.start_date_time);
          const slotEndTime = new Date(slot.end_date_time);
          
          // Create a date in the mentor's timezone for the specific day
          const recurringStartTime = new Date(date);
          recurringStartTime.setHours(slotStartTime.getHours(), slotStartTime.getMinutes(), 0, 0);
          
          const recurringEndTime = new Date(date);
          recurringEndTime.setHours(slotEndTime.getHours(), slotEndTime.getMinutes(), 0, 0);
          
          // Convert to mentor's timezone then to UTC for comparison
          const recurringStartInMentorTz = toZonedTime(recurringStartTime, mentorTimezone);
          const recurringEndInMentorTz = toZonedTime(recurringEndTime, mentorTimezone);
          const recurringStartUTC = fromZonedTime(recurringStartInMentorTz, 'UTC');
          const recurringEndUTC = fromZonedTime(recurringEndInMentorTz, 'UTC');
          
          console.log('Checking recurring slot:', {
            dayOfWeek: slot.day_of_week,
            scheduledDayOfWeek: scheduledAt.getDay(),
            recurringStartUTC: recurringStartUTC.toISOString(),
            recurringEndUTC: recurringEndUTC.toISOString(),
            scheduledAtUTC: scheduledAt.toISOString(),
            endTimeUTC: endTime.toISOString()
          });
          
          // Check if the requested time falls within this recurring slot
          if (
            scheduledAt.getDay() === slot.day_of_week && 
            scheduledAt >= recurringStartUTC && 
            endTime <= recurringEndUTC
          ) {
            validSlotFound = true;
            adjustedSlot = {
              ...slot,
              // Use the DST-adjusted times
              reference_timezone: mentorTimezone,
              dst_aware: true,
              timezone_offset: currentOffset
            };
            break;
          }
        } else {
          // For one-time slots, check if it's already DST-aware
          if (slot.dst_aware) {
            // If it's DST-aware, use it directly
            console.log('Checking DST-aware one-time slot:', {
              slotStart: slot.start_date_time,
              slotEnd: slot.end_date_time,
              scheduledAtUTC: scheduledAt.toISOString(),
              endTimeUTC: endTime.toISOString()
            });
            
            if (scheduledAt >= new Date(slot.start_date_time) && endTime <= new Date(slot.end_date_time)) {
              validSlotFound = true;
              adjustedSlot = slot;
              break;
            }
          } else {
            // If not DST-aware, check if there's a DST change to account for
            if (slot.timezone_offset !== undefined && 
                Math.abs(slot.timezone_offset - currentOffset) > 0) {
              
              // If there's a DST change, we need to adjust slot times
              const offsetDifference = currentOffset - slot.timezone_offset;
              
              console.log('DST change detected for one-time slot:', {
                storedOffset: slot.timezone_offset,
                currentOffset,
                offsetDifference
              });
              
              // Adjust the one-time slot for DST changes
              const adjustedStartTime = new Date(new Date(slot.start_date_time).getTime() + offsetDifference * 60 * 1000);
              const adjustedEndTime = new Date(new Date(slot.end_date_time).getTime() + offsetDifference * 60 * 1000);
              
              console.log('Comparing adjusted one-time slot with requested time:', {
                adjustedStartTime: adjustedStartTime.toISOString(),
                adjustedEndTime: adjustedEndTime.toISOString(),
                scheduledAtUTC: scheduledAt.toISOString(),
                endTimeUTC: endTime.toISOString()
              });
              
              if (scheduledAt >= adjustedStartTime && endTime <= adjustedEndTime) {
                validSlotFound = true;
                // Create an adjusted version of the slot
                adjustedSlot = {
                  ...slot,
                  start_date_time: adjustedStartTime.toISOString(),
                  end_date_time: adjustedEndTime.toISOString(),
                  timezone_offset: currentOffset, // Update with current offset
                  reference_timezone: mentorTimezone,
                  dst_aware: true
                };
                break;
              }
            } else {
              // No DST change, use original times
              console.log('Checking one-time slot (no DST change):', {
                slotStart: slot.start_date_time,
                slotEnd: slot.end_date_time,
                scheduledAtUTC: scheduledAt.toISOString(),
                endTimeUTC: endTime.toISOString()
              });
              
              if (scheduledAt >= new Date(slot.start_date_time) && endTime <= new Date(slot.end_date_time)) {
                validSlotFound = true;
                adjustedSlot = {
                  ...slot,
                  reference_timezone: mentorTimezone,
                  dst_aware: true,
                  timezone_offset: currentOffset
                };
                break;
              }
            }
          }
        }
      }

      if (!validSlotFound || !adjustedSlot) {
        return { success: false, error: 'No available slots match the requested time with timezone adjustments' };
      }

      // Step 4: Book the session using RPC function
      const formattedStartTime = format(scheduledAt, 'HH:mm');
      const formattedDate = format(scheduledAt, 'yyyy-MM-dd');

      console.log('Calling create_session_and_update_availability with:', {
        p_mentor_id: mentorId,
        p_scheduled_at: scheduledAt.toISOString(),
        p_session_date: formattedDate,
        p_start_time: formattedStartTime,
        slot_data: adjustedSlot
      });

      const { data: sessionData, error: sessionError } = await supabase
        .rpc('create_session_and_update_availability', {
          p_meeting_platform: meetingPlatform,
          p_mentee_id: (await supabase.auth.getUser()).data.user?.id,
          p_mentee_phone_number: menteePhoneNumber || null,
          p_mentee_telegram_username: menteeTelegramUsername || null,
          p_mentor_id: mentorId,
          p_notes: note,
          p_scheduled_at: scheduledAt.toISOString(),
          p_session_date: formattedDate,
          p_session_type_id: sessionTypeId,
          p_start_time: formattedStartTime
        });

      if (sessionError) {
        console.error('Session booking error:', sessionError);
        return { 
          success: false, 
          error: sessionError.message || 'Failed to book session'
        };
      }

      if (!sessionData) {
        return { 
          success: false, 
          error: 'No session data returned'
        };
      }

      const { session_id } = sessionData as { session_id: string };

      console.log('Session booked successfully:', sessionData);

      return { 
        success: true, 
        sessionId: session_id
      };
    } catch (error: any) {
      console.error('Error booking session:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  };

  // Helper function to get timezone-adjusted date
  function tzDate(date: Date, timezone: string): number {
    return new Date(date.toLocaleString('en-US', { timeZone: timezone })).getTime();
  }

  return bookSession;
}
