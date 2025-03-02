
import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { synchronizeAllHubStorage } from '@/utils/storageUtils';

export function HubStorageInitializer() {
  useEffect(() => {
    // Run a one-time check to update all hub storage values
    const initializeStorageValues = async () => {
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
    };
    
    initializeStorageValues();
  }, []);
  
  return null; // This component doesn't render anything
}
