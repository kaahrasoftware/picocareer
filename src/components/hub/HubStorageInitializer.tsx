
import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { synchronizeAllHubStorage } from '@/utils/storageUtils';
import { enableRealtimeForTables } from '@/utils/supabaseRealtime';

export function HubStorageInitializer() {
  useEffect(() => {
    // Run a one-time check to update all hub storage values
    const initializeStorageValues = async () => {
      try {
        // Look for hubs that have zero storage usage but might have resources
        const { data: hubs, error } = await supabase
          .from('hubs')
          .select('id, current_storage_usage')
          .eq('current_storage_usage', 0);
        
        if (error) {
          console.error('Error fetching hubs with zero storage:', error);
          return;
        }
        
        if (hubs && hubs.length > 0) {
          console.log(`Found ${hubs.length} hubs with zero storage. Updating...`);
          await synchronizeAllHubStorage();
        }
      } catch (error) {
        console.error('Error in storage initialization:', error);
      }
    };
    
    // Initialize storage values
    initializeStorageValues();
    
    // Enable real-time functionality
    const channel = enableRealtimeForTables();
    
    // Cleanup function
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);
  
  return null; // This component doesn't render anything
}
