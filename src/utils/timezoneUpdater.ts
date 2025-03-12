
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

        // Get current date for DST-aware offset calculation
        const now = new Date();
        
        // Calculate the timezone offset in minutes
        // This properly accounts for DST by using the current date
        let offsetMinutes;
        
        try {
          // Get timezone offset for the current time in minutes
          // Positive values for timezones west of UTC (Americas)
          // Negative values for timezones east of UTC (Europe, Asia, etc.)
          const tzDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
          const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
          offsetMinutes = (utcDate.getTime() - tzDate.getTime()) / (1000 * 60);
          
          console.log(`Timezone ${timezone} has offset: ${offsetMinutes} minutes`);
        } catch (err) {
          console.error(`Invalid timezone: ${timezone}`, err);
          errors.push({
            profileId: setting.profile_id,
            error: `Invalid timezone: ${timezone}`
          });
          continue;
        }

        // Update all availability slots for this mentor
        const { data: updateResult, error: updateError } = await supabase
          .from('mentor_availability')
          .update({ 
            timezone_offset: offsetMinutes,
            reference_timezone: timezone,
            dst_aware: true
          })
          .eq('profile_id', setting.profile_id);

        if (updateError) {
          errors.push({
            profileId: setting.profile_id,
            error: updateError
          });
        } else {
          updatedCount++;
          console.log(`Updated timezone offset for mentor ${setting.profile_id} to ${offsetMinutes} minutes (${timezone})`);
        }
      } catch (err) {
        errors.push({
          profileId: setting.profile_id,
          error: err
        });
      }
    }

    // 3. Get update counts
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

// Helper function to get timezone offset for debugging
export async function getTimezoneOffsetForDebugging(timezone) {
  try {
    if (!timezone) return null;
    
    const now = new Date();
    const tzDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
    const offsetMinutes = (utcDate.getTime() - tzDate.getTime()) / (1000 * 60);
    
    return {
      timezone,
      offsetMinutes,
      date: now.toISOString(),
      isDST: isDaylightSavingTime(timezone)
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
