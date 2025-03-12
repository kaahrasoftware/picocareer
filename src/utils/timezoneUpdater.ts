
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
    
    console.log(`Processing ${mentorSettings?.length || 0} mentor timezone settings`);
    
    // 2. Process each mentor's timezone
    for (const setting of mentorSettings) {
      try {
        const timezone = setting.setting_value;
        if (!timezone) continue;

        // Get timezone offset using our helper function
        const offsetMinutes = getTimezoneOffsetMinutes(timezone);
        
        if (offsetMinutes === null) {
          console.error(`Invalid timezone: ${timezone}`);
          errors.push({
            profileId: setting.profile_id,
            error: `Invalid timezone: ${timezone}`
          });
          continue;
        }
        
        console.log(`Profile ${setting.profile_id}: Timezone ${timezone} has offset: ${offsetMinutes} minutes`);

        // 3. First, update recurring availability slots
        const { data: recurringSlots, error: recurringError } = await supabase
          .from('mentor_availability')
          .select('id')
          .eq('profile_id', setting.profile_id)
          .eq('recurring', true);
          
        if (recurringError) {
          console.error('Error fetching recurring availability:', recurringError);
          errors.push({
            profileId: setting.profile_id,
            error: `Error fetching recurring slots: ${recurringError.message}`
          });
        } else {
          console.log(`Found ${recurringSlots?.length || 0} recurring slots for profile ${setting.profile_id}`);
          
          // Process recurring slots if any exist
          if (recurringSlots && recurringSlots.length > 0) {
            // Update recurring slots in batches to avoid rate limits
            const batchSize = 50;
            for (let i = 0; i < recurringSlots.length; i += batchSize) {
              const batch = recurringSlots.slice(i, i + batchSize);
              const slotIds = batch.map(slot => slot.id);
              
              console.log(`Updating batch of ${batch.length} recurring slots for profile ${setting.profile_id}`);
              
              // Update the batch of recurring slots
              const { error: updateRecurringError, count } = await supabase
                .from('mentor_availability')
                .update({ 
                  timezone_offset: offsetMinutes,
                  reference_timezone: timezone,
                  dst_aware: true
                })
                .in('id', slotIds);
                
              if (updateRecurringError) {
                console.error(`Error updating recurring slots batch for profile ${setting.profile_id}:`, updateRecurringError);
                errors.push({
                  profileId: setting.profile_id,
                  error: `Error updating recurring slots: ${updateRecurringError.message}`
                });
              } else {
                updatedCount += count || 0;
                console.log(`Successfully updated ${count} recurring slots in batch for profile ${setting.profile_id}`);
              }
            }
          }
        }
        
        // 4. Then update non-recurring availability slots
        const { data: nonRecurringSlots, error: nonRecurringError } = await supabase
          .from('mentor_availability')
          .select('id')
          .eq('profile_id', setting.profile_id)
          .eq('recurring', false);
          
        if (nonRecurringError) {
          console.error('Error fetching non-recurring availability:', nonRecurringError);
          errors.push({
            profileId: setting.profile_id,
            error: `Error fetching non-recurring slots: ${nonRecurringError.message}`
          });
        } else {
          console.log(`Found ${nonRecurringSlots?.length || 0} non-recurring slots for profile ${setting.profile_id}`);
          
          // Process non-recurring slots if any exist
          if (nonRecurringSlots && nonRecurringSlots.length > 0) {
            // Update non-recurring slots in batches to avoid rate limits
            const batchSize = 50;
            for (let i = 0; i < nonRecurringSlots.length; i += batchSize) {
              const batch = nonRecurringSlots.slice(i, i + batchSize);
              const slotIds = batch.map(slot => slot.id);
              
              console.log(`Updating batch of ${batch.length} non-recurring slots for profile ${setting.profile_id}`);
              
              // Update the batch of non-recurring slots
              const { error: updateNonRecurringError, count } = await supabase
                .from('mentor_availability')
                .update({ 
                  timezone_offset: offsetMinutes,
                  reference_timezone: timezone,
                  dst_aware: true
                })
                .in('id', slotIds);
                
              if (updateNonRecurringError) {
                console.error(`Error updating non-recurring slots batch for profile ${setting.profile_id}:`, updateNonRecurringError);
                errors.push({
                  profileId: setting.profile_id,
                  error: `Error updating non-recurring slots: ${updateNonRecurringError.message}`
                });
              } else {
                updatedCount += count || 0;
                console.log(`Successfully updated ${count} non-recurring slots in batch for profile ${setting.profile_id}`);
              }
            }
          }
        }
      } catch (err) {
        console.error(`Error processing mentor ${setting.profile_id}:`, err);
        errors.push({
          profileId: setting.profile_id,
          error: err
        });
      }
    }

    // 5. Get update counts
    const { count, error: countError } = await supabase
      .from('mentor_availability')
      .select('*', { count: 'exact', head: true })
      .eq('dst_aware', true);
      
    if (countError) {
      console.error('Error counting DST-aware slots:', countError);
    }

    const result = {
      success: true,
      updatedCount,
      totalDSTAwareSlots: count || 0,
      errors: errors.length > 0 ? errors : null
    };
    
    console.log('Timezone update completed:', result);
    return result;
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
