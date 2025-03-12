
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

        // Calculate current offset for this timezone
        const now = new Date();
        const timezoneOffsetMinutes = new Date().toLocaleString('en-US', {
          timeZone: timezone,
          timeZoneName: 'short'
        }).match(/GMT([+-]\d+)/)?.[1];

        if (!timezoneOffsetMinutes) continue;

        // Convert offset to minutes
        const offsetMinutes = parseInt(timezoneOffsetMinutes) * 60;

        // Update all availability slots for this mentor
        const { error: updateError } = await supabase
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
        }
      } catch (err) {
        errors.push({
          profileId: setting.profile_id,
          error: err
        });
      }
    }

    return {
      success: true,
      updatedCount,
      errors: errors.length > 0 ? errors : null
    };
  } catch (error) {
    console.error('Error in updateMentorTimezoneOffsets:', error);
    return { success: false, error };
  }
}
