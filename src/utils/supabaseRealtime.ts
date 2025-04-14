
import { supabase } from "@/integrations/supabase/client";

/**
 * Enables real-time functionality for specific tables
 * Call this function early in your application to set up real-time subscriptions
 */
export async function enableRealtimeForTables() {
  try {
    // Check if real-time is already enabled for these tables
    const { data, error } = await supabase.from('_realtime').select('*');
    
    console.log('Setting up real-time subscriptions for bookmarks and other tables');
    
    // Set up channel for user bookmarks
    const bookmarksChannel = supabase
      .channel('public:user_bookmarks')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'user_bookmarks' 
      }, payload => {
        console.log('Bookmark change detected:', payload);
      })
      .subscribe(status => {
        console.log('Bookmark subscription status:', status);
      });
      
    return bookmarksChannel;
  } catch (error) {
    console.error('Error setting up real-time functionality:', error);
    return null;
  }
}
