
// This utility handles timezone offset updates for mentor availability slots
// with special attention to DST (Daylight Saving Time) transitions

// Get DST transitions for the current year for a given timezone
export function getDSTTransitions(timezone: string) {
  const result = {
    hasDST: false,
    dstStart: null as Date | null,
    dstEnd: null as Date | null
  };
  
  try {
    const year = new Date().getFullYear();
    
    // Check if timezone has DST by comparing January and July offsets
    const januaryDate = new Date(year, 0, 1);
    const julyDate = new Date(year, 6, 1);
    
    const januaryOffset = getTimezoneOffset(januaryDate, timezone);
    const julyOffset = getTimezoneOffset(julyDate, timezone);
    
    if (januaryOffset === julyOffset) {
      return result; // No DST for this timezone
    }
    
    result.hasDST = true;
    
    // Find the DST start date (when offset changes)
    let dstStart = new Date(year, 0, 1);
    let dstEnd = new Date(year, 11, 31);
    
    // Binary search to find DST start date
    let startLow = new Date(year, 0, 1);
    let startHigh = new Date(year, 6, 1);
    
    while (startLow <= startHigh) {
      const mid = new Date((startLow.getTime() + startHigh.getTime()) / 2);
      const midOffset = getTimezoneOffset(mid, timezone);
      const prevDayOffset = getTimezoneOffset(new Date(mid.getTime() - 86400000), timezone);
      
      if (midOffset !== prevDayOffset) {
        dstStart = mid;
        break;
      } else if (midOffset === januaryOffset) {
        startLow = new Date(mid.getTime() + 86400000);
      } else {
        startHigh = new Date(mid.getTime() - 86400000);
      }
    }
    
    // Binary search to find DST end date
    let endLow = new Date(year, 6, 1);
    let endHigh = new Date(year, 11, 31);
    
    while (endLow <= endHigh) {
      const mid = new Date((endLow.getTime() + endHigh.getTime()) / 2);
      const midOffset = getTimezoneOffset(mid, timezone);
      const prevDayOffset = getTimezoneOffset(new Date(mid.getTime() - 86400000), timezone);
      
      if (midOffset !== prevDayOffset) {
        dstEnd = mid;
        break;
      } else if (midOffset === januaryOffset) {
        endHigh = new Date(mid.getTime() - 86400000);
      } else {
        endLow = new Date(mid.getTime() + 86400000);
      }
    }
    
    result.dstStart = dstStart;
    result.dstEnd = dstEnd;
    
    return result;
  } catch (error) {
    console.error('Error calculating DST transitions:', error);
    return result;
  }
}

// Calculate the timezone offset in minutes for a specific date and timezone
export function getTimezoneOffset(date: Date, timezone: string): number {
  try {
    // Format the date in the specified timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false
    });
    
    // Get parts of the formatted date
    const parts = formatter.formatToParts(date);
    
    // Create a date string in ISO format from the parts
    const year = parts.find(part => part.type === 'year')?.value || '2023';
    const month = parts.find(part => part.type === 'month')?.value || '01';
    const day = parts.find(part => part.type === 'day')?.value || '01';
    const hour = parts.find(part => part.type === 'hour')?.value || '00';
    const minute = parts.find(part => part.type === 'minute')?.value || '00';
    const second = parts.find(part => part.type === 'second')?.value || '00';
    
    // Create date objects for the UTC time and the timezone-adjusted time
    const localDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:${second.padStart(2, '0')}`);
    const utcDate = new Date(Date.UTC(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hour),
      parseInt(minute),
      parseInt(second)
    ));
    
    // Calculate the offset in minutes
    const offsetMinutes = (utcDate.getTime() - localDate.getTime()) / (60 * 1000);
    
    return offsetMinutes;
  } catch (error) {
    console.error('Error calculating timezone offset:', error);
    return 0;
  }
}

// Check if a timezone is currently in DST
export function isTimezoneDST(timezone: string): boolean {
  try {
    const now = new Date();
    const transitions = getDSTTransitions(timezone);
    
    if (!transitions.hasDST) return false;
    
    const januaryOffset = getTimezoneOffset(new Date(now.getFullYear(), 0, 1), timezone);
    const currentOffset = getTimezoneOffset(now, timezone);
    
    // If current offset is different from January offset, we're in DST
    return currentOffset !== januaryOffset;
  } catch (error) {
    console.error('Error checking DST status:', error);
    return false;
  }
}

// For debugging: get detailed timezone offset information
export async function getTimezoneOffsetForDebugging(timezone: string) {
  try {
    const now = new Date();
    
    // Calculate offset using our custom function
    const offsetMinutes = getTimezoneOffset(now, timezone);
    
    // Calculate offset using browser's built-in function (for comparison)
    const dateFormatter = new Intl.DateTimeFormat('en-US', { timeZone: timezone });
    const formattedDate = dateFormatter.format(now);
    const localDate = new Date(formattedDate);
    const alternateOffset = now.getTimezoneOffset() * -1;
    
    // Check current DST status
    const isDST = isTimezoneDST(timezone);
    
    // Get DST transitions
    const dstTransitions = getDSTTransitions(timezone);
    
    return {
      timezone,
      offsetMinutes,
      alternateOffset,
      isDST,
      dstTransitions,
      timestamp: now.toISOString()
    };
  } catch (error) {
    console.error('Error in getTimezoneOffsetForDebugging:', error);
    return {
      error: `Failed to get timezone information: ${error.message}`,
      timezone
    };
  }
}

// Update mentor availability slots for DST changes
export async function updateMentorTimezoneOffsets() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Authentication required');
    }

    // Process recurring slots first
    console.log('Starting timezone update process - recurring slots first');
    const recurringResult = await processRecurringSlots();
    
    // Then process non-recurring slots
    console.log('Processing non-recurring slots');
    const nonRecurringResult = await processNonRecurringSlots();
    
    // Combine results
    const totalUpdatedCount = recurringResult.updatedCount + nonRecurringResult.updatedCount;
    const combinedErrors = [...recurringResult.errors, ...nonRecurringResult.errors];
    const totalDSTAwareSlots = recurringResult.dstAwareCount + nonRecurringResult.dstAwareCount;
    
    console.log(`Timezone update completed. Total updated: ${totalUpdatedCount}, Total DST-aware: ${totalDSTAwareSlots}, Errors: ${combinedErrors.length}`);
    
    return {
      success: true,
      updatedCount: totalUpdatedCount,
      totalDSTAwareSlots,
      errors: combinedErrors
    };
  } catch (error) {
    console.error('Error updating timezone offsets:', error);
    return {
      success: false,
      error
    };
  }
}

// Process recurring availability slots
async function processRecurringSlots() {
  const errors = [];
  let updatedCount = 0;
  let dstAwareCount = 0;
  
  try {
    // Get all unique timezone settings from users
    const { data: timezoneSettings, error: settingsError } = await supabase
      .from('user_settings')
      .select('profile_id, setting_value')
      .eq('setting_type', 'timezone');
    
    if (settingsError) throw settingsError;
    
    // Process each mentor's timezone
    for (const setting of timezoneSettings || []) {
      try {
        const { profile_id, setting_value: timezone } = setting;
        
        // Skip if timezone is invalid
        if (!timezone) continue;
        
        // Get current offset for this timezone
        const now = new Date();
        const offsetMinutes = getTimezoneOffset(now, timezone);
        
        console.log(`Updating recurring slots for mentor ${profile_id} with timezone ${timezone} (offset: ${offsetMinutes})`);
        
        // Update all recurring slots for this mentor
        const { data: updateResult, error: updateError } = await supabase
          .from('mentor_availability')
          .update({
            timezone_offset: offsetMinutes,
            reference_timezone: timezone,
            dst_aware: true,
            last_dst_check: new Date().toISOString()
          })
          .eq('profile_id', profile_id)
          .eq('recurring', true)
          .select('count');
        
        if (updateError) {
          errors.push({ profile_id, error: updateError.message, type: 'recurring' });
          continue;
        }
        
        // Count the number of slots updated
        const slotsUpdated = updateResult?.length || 0;
        updatedCount += slotsUpdated;
        
        // Get count of all DST-aware slots for this mentor
        const { count: mentorDSTAwareCount, error: countError } = await supabase
          .from('mentor_availability')
          .select('id', { count: 'exact', head: true })
          .eq('profile_id', profile_id)
          .eq('dst_aware', true);
        
        if (!countError) {
          dstAwareCount += mentorDSTAwareCount || 0;
        }
        
        console.log(`Updated ${slotsUpdated} recurring slots for mentor ${profile_id}`);
      } catch (mentorError) {
        console.error('Error updating mentor:', mentorError);
        errors.push({ error: mentorError.message, type: 'mentor_processing' });
      }
    }
  } catch (error) {
    console.error('Error processing recurring slots:', error);
    errors.push({ error: error.message, type: 'recurring_batch' });
  }
  
  return { updatedCount, dstAwareCount, errors };
}

// Process non-recurring availability slots
async function processNonRecurringSlots() {
  const errors = [];
  let updatedCount = 0;
  let dstAwareCount = 0;
  
  try {
    // Get all unique timezone settings from users
    const { data: timezoneSettings, error: settingsError } = await supabase
      .from('user_settings')
      .select('profile_id, setting_value')
      .eq('setting_type', 'timezone');
    
    if (settingsError) throw settingsError;
    
    // Process each mentor's timezone
    for (const setting of timezoneSettings || []) {
      try {
        const { profile_id, setting_value: timezone } = setting;
        
        // Skip if timezone is invalid
        if (!timezone) continue;
        
        // Get future non-recurring slots for this mentor
        const now = new Date();
        const { data: slots, error: slotsError } = await supabase
          .from('mentor_availability')
          .select('id, start_date_time')
          .eq('profile_id', profile_id)
          .eq('recurring', false)
          .gt('start_date_time', now.toISOString())
          .order('start_date_time', { ascending: true });
        
        if (slotsError) {
          errors.push({ profile_id, error: slotsError.message, type: 'fetch_slots' });
          continue;
        }
        
        console.log(`Found ${slots?.length || 0} non-recurring slots for mentor ${profile_id}`);
        
        // Process each slot to update its timezone information
        for (const slot of slots || []) {
          try {
            const slotDate = new Date(slot.start_date_time);
            const offsetMinutes = getTimezoneOffset(slotDate, timezone);
            
            const { error: updateError } = await supabase
              .from('mentor_availability')
              .update({
                timezone_offset: offsetMinutes,
                reference_timezone: timezone,
                dst_aware: true,
                last_dst_check: new Date().toISOString()
              })
              .eq('id', slot.id);
            
            if (updateError) {
              errors.push({ slotId: slot.id, error: updateError.message, type: 'update_slot' });
              continue;
            }
            
            updatedCount++;
          } catch (slotError) {
            errors.push({ slotId: slot.id, error: slotError.message, type: 'process_slot' });
          }
        }
        
        // Get count of all DST-aware slots for this mentor
        const { count: mentorDSTAwareCount, error: countError } = await supabase
          .from('mentor_availability')
          .select('id', { count: 'exact', head: true })
          .eq('profile_id', profile_id)
          .eq('dst_aware', true)
          .eq('recurring', false);
        
        if (!countError) {
          dstAwareCount += mentorDSTAwareCount || 0;
        }
      } catch (mentorError) {
        console.error('Error updating mentor non-recurring slots:', mentorError);
        errors.push({ error: mentorError.message, type: 'mentor_processing_non_recurring' });
      }
    }
  } catch (error) {
    console.error('Error processing non-recurring slots:', error);
    errors.push({ error: error.message, type: 'non_recurring_batch' });
  }
  
  return { updatedCount, dstAwareCount, errors };
}

import { supabase } from "@/integrations/supabase/client";
