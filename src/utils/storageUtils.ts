
import { supabase } from "@/integrations/supabase/client";

export async function updateHubStorageUsage(hubId: string) {
  try {
    // First, get the current storage metrics
    const { data: metricsData, error: metricsError } = await supabase
      .from('hub_storage_metrics')
      .select('total_storage_bytes')
      .eq('hub_id', hubId)
      .single();

    if (metricsError && metricsError.code !== 'PGRST116') {
      console.error('Error fetching storage metrics:', metricsError);
      return false;
    }

    // If we have metrics data, update the hub table
    if (metricsData) {
      const { error: updateError } = await supabase
        .from('hubs')
        .update({ 
          current_storage_usage: metricsData.total_storage_bytes,
          updated_at: new Date().toISOString()
        })
        .eq('id', hubId);

      if (updateError) {
        console.error('Error updating hub storage usage:', updateError);
        return false;
      }
      
      return true;
    } else {
      // If no metrics found, refresh them by calling the RPC function
      const { data, error } = await supabase
        .rpc('refresh_hub_metrics', { hub_uuid: hubId });
      
      if (error) {
        console.error('Error refreshing hub metrics:', error);
        return false;
      }
      
      return true;
    }
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
    for (const hub of hubs || []) {
      await updateHubStorageUsage(hub.id);
    }
    
    return true;
  } catch (error) {
    console.error('Error in synchronizeAllHubStorage:', error);
    return false;
  }
}
