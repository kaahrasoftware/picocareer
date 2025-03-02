
import { supabase } from "@/integrations/supabase/client";

export async function updateHubStorageUsage(hubId: string) {
  try {
    // Call the new centralized refresh_hub_metrics function
    const { data, error } = await supabase
      .rpc('refresh_hub_metrics', { hub_uuid: hubId });
    
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
