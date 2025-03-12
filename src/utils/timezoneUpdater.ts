
import { supabase } from "@/integrations/supabase/client";

// Helper function for accurate timezone offset calculation
function getTimezoneOffsetMinutes(timezone: string) {
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

// Function to check if a timezone is in DST currently
function isCurrentlyInDST(timezone: string) {
  try {
    // Get January and July dates for comparison (standard vs DST)
    const january = new Date(new Date().getFullYear(), 0, 1);
    const july = new Date(new Date().getFullYear(), 6, 1);
    
    // Get timezone offsets for these dates
    const januaryOffset = getTimezoneOffsetMinutes(timezone);
    const julyOffset = getTimezoneOffsetMinutes(timezone);
    
    // If offsets differ, one of them is in DST
    return januaryOffset !== julyOffset;
  } catch (e) {
    console.error('Error checking DST status:', e);
    return false;
  }
}

// Get the DST transition dates for a timezone in the current year
function getDSTTransitionDates(timezone: string) {
  try {
    const year = new Date().getFullYear();
    const result = {
      dstStart: null as Date | null,
      dstEnd: null as Date | null,
      hasDST: false
    };
    
    // Check if this timezone observes DST at all by comparing January and July
    const januaryOffset = getTimezoneOffsetMinutes(timezone);
    const julyOffset = getTimezoneOffsetMinutes(timezone);
    
    if (januaryOffset === julyOffset) {
      // No DST observed in this timezone
      return result;
    }
    
    result.hasDST = true;
    
    // Determine which half of the year is DST (northern or southern hemisphere)
    const isDSTInSummer = Math.abs(julyOffset || 0) < Math.abs(januaryOffset || 0);
    
    // For Northern Hemisphere, DST typically starts March-April and ends October-November
    // For Southern Hemisphere, it's reversed
    let dstStartMonth, dstEndMonth;
    
    if (isDSTInSummer) {
      // Northern Hemisphere pattern
      dstStartMonth = 2; // March
      dstEndMonth = 10; // November
    } else {
      // Southern Hemisphere pattern
      dstStartMonth = 9; // October
      dstEndMonth = 3; // April
    }
    
    // Find exact DST start date (search by binary division)
    let startLow = 1;
    let startHigh = 31;
    
    while (startLow <= startHigh) {
      const mid = Math.floor((startLow + startHigh) / 2);
      const testDate = new Date(Date.UTC(year, dstStartMonth, mid));
      const prevDate = new Date(Date.UTC(year, dstStartMonth, mid - 1));
      
      const midOffset = getTimezoneOffsetMinutes(timezone);
      const prevOffset = getTimezoneOffsetMinutes(timezone);
      
      if (midOffset !== prevOffset) {
        result.dstStart = testDate;
        break;
      }
      
      if ((isDSTInSummer && midOffset === januaryOffset) || 
          (!isDSTInSummer && midOffset !== januaryOffset)) {
        startLow = mid + 1;
      } else {
        startHigh = mid - 1;
      }
    }
    
    // Find exact DST end date
    let endLow = 1;
    let endHigh = 31;
    
    while (endLow <= endHigh) {
      const mid = Math.floor((endLow + endHigh) / 2);
      const testDate = new Date(Date.UTC(year, dstEndMonth, mid));
      const prevDate = new Date(Date.UTC(year, dstEndMonth, mid - 1));
      
      const midOffset = getTimezoneOffsetMinutes(timezone);
      const prevOffset = getTimezoneOffsetMinutes(timezone);
      
      if (midOffset !== prevOffset) {
        result.dstEnd = testDate;
        break;
      }
      
      if ((isDSTInSummer && midOffset !== januaryOffset) || 
          (!isDSTInSummer && midOffset === januaryOffset)) {
        endLow = mid + 1;
      } else {
        endHigh = mid - 1;
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error determining DST transition dates:', error);
    return {
      dstStart: null,
      dstEnd: null,
      hasDST: false
    };
  }
}

// Main function to update mentor timezone offsets
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
    let totalDSTAwareSlots = 0;
    
    console.log(`Processing ${mentorSettings?.length || 0} mentor timezone settings`);
    
    // 2. First update all recurring slots - these are crucial since they repeat weekly
    for (const setting of mentorSettings) {
      try {
        const timezone = setting.setting_value;
        if (!timezone) continue;

        // Get timezone offset and DST info
        const offsetMinutes = getTimezoneOffsetMinutes(timezone);
        const isDST = isCurrentlyInDST(timezone);
        
        if (offsetMinutes === null) {
          console.error(`Invalid timezone: ${timezone}`);
          errors.push({
            profileId: setting.profile_id,
            error: `Invalid timezone: ${timezone}`
          });
          continue;
        }
        
        console.log(`Profile ${setting.profile_id}: Timezone ${timezone} has offset: ${offsetMinutes} minutes (DST active: ${isDST})`);

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
                  dst_aware: true,
                  last_dst_check: new Date().toISOString(),
                  is_dst: isDST
                })
                .in('id', slotIds)
                .select('count');
                
              if (updateRecurringError) {
                console.error(`Error updating recurring slots batch for profile ${setting.profile_id}:`, updateRecurringError);
                errors.push({
                  profileId: setting.profile_id,
                  error: `Error updating recurring slots: ${updateRecurringError.message}`
                });
              } else {
                updatedCount += count || 0;
                totalDSTAwareSlots += count || 0;
                console.log(`Successfully updated ${count} recurring slots in batch for profile ${setting.profile_id}`);
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
    
    // 3. Now process non-recurring slots AFTER updating all recurring slots
    for (const setting of mentorSettings) {
      try {
        const timezone = setting.setting_value;
        if (!timezone) continue;

        // Get timezone offset using our helper function
        const offsetMinutes = getTimezoneOffsetMinutes(timezone);
        const isDST = isCurrentlyInDST(timezone);
        
        if (offsetMinutes === null) continue; // Already logged error above
        
        // 4. Now update non-recurring availability slots
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
                  dst_aware: true,
                  last_dst_check: new Date().toISOString(),
                  is_dst: isDST
                })
                .in('id', slotIds)
                .select('count');
                
              if (updateNonRecurringError) {
                console.error(`Error updating non-recurring slots batch for profile ${setting.profile_id}:`, updateNonRecurringError);
                errors.push({
                  profileId: setting.profile_id,
                  error: `Error updating non-recurring slots: ${updateNonRecurringError.message}`
                });
              } else {
                updatedCount += count || 0;
                totalDSTAwareSlots += count || 0;
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

    const result = {
      success: true,
      updatedCount,
      totalDSTAwareSlots,
      errors: errors.length > 0 ? errors : null
    };
    
    console.log('Timezone update completed:', result);
    return result;
  } catch (error) {
    console.error('Error in updateMentorTimezoneOffsets:', error);
    return { success: false, error };
  }
}

// Helper function to get timezone offset for debugging
export async function getTimezoneOffsetForDebugging(timezone: string) {
  try {
    if (!timezone) return { error: "No timezone provided" };
    
    const offsetMinutes = getTimezoneOffsetMinutes(timezone);
    const isDST = isCurrentlyInDST(timezone);
    const dstTransitions = getDSTTransitionDates(timezone);
    
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
      isDST,
      dstTransitions,
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
