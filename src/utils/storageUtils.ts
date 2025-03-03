
import { supabase } from "@/integrations/supabase/client";

export async function updateHubStorageUsage(hubId: string) {
  try {
    // Call the centralized refresh_hub_metrics function
    const { data, error } = await supabase
      .rpc('refresh_hub_metrics', { _hub_id: hubId });
    
    if (error) {
      console.error('Error refreshing hub metrics:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateHubStorageUsage:', error);
    return false;
  }
}

export async function synchronizeAllHubStorage() {
  try {
    // Get all hubs
    const { data: hubs, error } = await supabase
      .from('hubs')
      .select('id, name');
    
    if (error) {
      console.error('Error fetching hubs:', error);
      return false;
    }

    // Update storage usage for each hub
    const results = [];
    for (const hub of hubs || []) {
      const result = await updateHubStorageUsage(hub.id);
      results.push({ hubId: hub.id, success: result });
    }
    
    return results;
  } catch (error) {
    console.error('Error in synchronizeAllHubStorage:', error);
    return false;
  }
}

// Convert bytes to human-readable format with appropriate unit
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  // Ensure we don't exceed available units
  const unitIndex = Math.min(i, units.length - 1);
  
  // Format with appropriate precision (more decimals for smaller numbers)
  return `${(bytes / Math.pow(1024, unitIndex)).toFixed(unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`;
}

// Convert a string with unit to bytes
export function parseFileSizeToBytes(sizeStr: string): number {
  if (!sizeStr || typeof sizeStr !== 'string') return 0;
  
  const units = {
    'b': 1,
    'kb': 1024,
    'mb': 1024 * 1024,
    'gb': 1024 * 1024 * 1024,
    'tb': 1024 * 1024 * 1024 * 1024,
    'pb': 1024 * 1024 * 1024 * 1024 * 1024
  };
  
  // Extract number and unit
  const matches = sizeStr.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*([a-z]+)$/);
  if (!matches) return 0;
  
  const size = parseFloat(matches[1]);
  const unit = matches[2];
  
  if (units[unit]) {
    return size * units[unit];
  }
  
  return size; // Assume bytes if unit not recognized
}
