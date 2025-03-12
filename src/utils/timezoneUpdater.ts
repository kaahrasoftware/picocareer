
import { supabase } from "@/integrations/supabase/client";

export async function updateMentorTimezoneOffsets() {
  try {
    // 1. Get all mentor settings with timezones
    const { data: mentorSettings, error: settingsError } = await supabase
      .from('user_settings')
      .select('profile_id, setting_value')
      .eq('setting_type', 'timezone');

    if (settingsError) {
      console.error('Error fetching mentor timezones:', settingsError);
      return { success: false, error: settingsError };
    }

    let updatedCount = 0;
    let errors = [];
    
    // 2. Process each mentor's timezone
    for (const setting of mentorSettings) {
      try {
        const timezone = setting.setting_value;
        if (!timezone) continue;

        // IMPORTANT: Fix for DST calculation - get current timezone offset directly
        // This is a more reliable way to calculate the correct offset with DST handling
        const offsetMinutes = getTimezoneOffsetMinutes(timezone);
        
        if (offsetMinutes === null) {
          console.error(`Invalid timezone: ${timezone}`);
          errors.push({
            profileId: setting.profile_id,
            error: `Invalid timezone: ${timezone}`
          });
          continue;
        }
        
        console.log(`Timezone ${timezone} has offset: ${offsetMinutes} minutes`);

        // 3. Update both recurring and non-recurring availability slots
        const { data: availabilityData, error: availabilityError } = await supabase
          .from('mentor_availability')
          .select('*')
          .eq('profile_id', setting.profile_id);

        if (availabilityError) {
          console.error('Error fetching availability:', availabilityError);
          continue;
        }

        for (const slot of availabilityData || []) {
          try {
            // Update the slot with new timezone information
            const { error: updateError } = await supabase
              .from('mentor_availability')
              .update({ 
                timezone_offset: offsetMinutes,
                reference_timezone: timezone,
                dst_aware: true
              })
              .eq('id', slot.id);

            if (updateError) {
              errors.push({
                profileId: setting.profile_id,
                error: updateError
              });
            } else {
              updatedCount++;
              console.log(`Updated timezone offset for slot ${slot.id} to ${offsetMinutes} minutes (${timezone})`);
            }
          } catch (err) {
            errors.push({
              profileId: setting.profile_id,
              slotId: slot.id,
              error: err
            });
          }
        }
      } catch (err) {
        errors.push({
          profileId: setting.profile_id,
          error: err
        });
      }
    }

    // 4. Get update counts
    const { count, error: countError } = await supabase
      .from('mentor_availability')
      .select('*', { count: 'exact', head: true })
      .eq('dst_aware', true);

    return {
      success: true,
      updatedCount,
      totalDSTAwareSlots: count || 0,
      errors: errors.length > 0 ? errors : null
    };
  } catch (error) {
    console.error('Error in updateMentorTimezoneOffsets:', error);
    return { success: false, error };
  }
}

// Helper function for accurate timezone offset calculation
function getTimezoneOffsetMinutes(timezone) {
  try {
    if (!timezone) return null;
    
    // Use the most accurate method to determine timezone offset with DST
    const date = new Date();
    
    // Get current date in UTC 
    const utcDate = new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        date.getUTCHours(),
        date.getUTCMinutes(),
        date.getUTCSeconds()
      )
    );
    
    // Format the date in the target timezone
    const options = { timeZone: timezone };
    
    // Get parts of the date in the target timezone
    const targetYear = new Date(date.toLocaleString('en-US', { ...options, year: 'numeric' })).getFullYear();
    const targetMonth = new Date(date.toLocaleString('en-US', { ...options, month: 'numeric' })).getMonth();
    const targetDay = new Date(date.toLocaleString('en-US', { ...options, day: 'numeric' })).getDate();
    const targetHour = new Date(date.toLocaleString('en-US', { ...options, hour: 'numeric', hour12: false })).getHours();
    const targetMinute = new Date(date.toLocaleString('en-US', { ...options, minute: 'numeric' })).getMinutes();
    
    // Create date objects for comparison
    const targetDate = new Date(targetYear, targetMonth, targetDay, targetHour, targetMinute);
    
    // Calculate offset in minutes
    // Negative for west of UTC (e.g., America/New_York)
    // Positive for east of UTC (e.g., Europe/London during summer)
    const offsetMinutes = -Math.round((targetDate.getTime() - utcDate.getTime()) / (60 * 1000));
    
    return offsetMinutes;
  } catch (error) {
    console.error('Error calculating timezone offset:', error);
    return null;
  }
}

// Helper function to get timezone offset for debugging
export async function getTimezoneOffsetForDebugging(timezone) {
  try {
    if (!timezone) return null;
    
    const offsetMinutes = getTimezoneOffsetMinutes(timezone);
    
    // Additional calculations for validation
    const now = new Date();
    const tzDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
    const alternateOffset = -(tzDate.getTime() - utcDate.getTime()) / (1000 * 60);
    
    return {
      timezone,
      offsetMinutes,
      alternateOffset,
      date: now.toISOString(),
      isDST: isDaylightSavingTime(timezone),
      dateComponents: {
        utc: {
          year: now.getUTCFullYear(),
          month: now.getUTCMonth(),
          day: now.getUTCDate(),
          hour: now.getUTCHours(),
          minute: now.getUTCMinutes()
        },
        local: {
          year: now.getFullYear(),
          month: now.getMonth(),
          day: now.getDate(),
          hour: now.getHours(),
          minute: now.getMinutes()
        }
      }
    };
  } catch (error) {
    return { error: error.message };
  }
}

// Helper to check if a timezone is currently in DST
function isDaylightSavingTime(timezone) {
  try {
    const january = new Date(new Date().getFullYear(), 0, 1);
    const july = new Date(new Date().getFullYear(), 6, 1);
    
    const januaryOffset = new Date(january.toLocaleString('en-US', { timeZone: timezone })).getTimezoneOffset();
    const julyOffset = new Date(july.toLocaleString('en-US', { timeZone: timezone })).getTimezoneOffset();
    
    return Math.max(januaryOffset, julyOffset) !== new Date().getTimezoneOffset();
  } catch (e) {
    return false;
  }
}
