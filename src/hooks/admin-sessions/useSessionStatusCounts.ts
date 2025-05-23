
import { supabase } from "@/integrations/supabase/client";
import { StatusCounts } from "./types";

// Helper function to fetch counts by status
export async function fetchStatusCounts(
  startDate?: string, 
  endDate?: string, 
  searchTerm?: string
): Promise<StatusCounts> {
  try {
    // Create base query builder to apply the same filters
    const createBaseQuery = () => {
      let query = supabase.from("mentor_sessions").select("*", { count: "exact" });
      
      // Apply date filters if provided
      if (startDate) {
        query = query.gte("scheduled_at", startDate);
      }
      
      if (endDate) {
        query = query.lte("scheduled_at", endDate);
      }
      
      if (searchTerm && searchTerm.trim() !== '') {
        // For the count query, we need to use a join and or statements
        query = query.or(`
          mentor_id.in.(select id from profiles where full_name ilike '%${searchTerm}%'),
          mentee_id.in.(select id from profiles where full_name ilike '%${searchTerm}%')
        `);
      }
      
      return query;
    };
    
    // Create separate queries for each status
    const totalQuery = createBaseQuery();
    const completedQuery = createBaseQuery().eq('status', 'completed');
    const scheduledQuery = createBaseQuery().eq('status', 'scheduled');
    const cancelledQuery = createBaseQuery().eq('status', 'cancelled');
    const noShowQuery = createBaseQuery().eq('status', 'no_show');
    
    // Execute all queries in parallel and ensure we call .count() on each query
    const results = await Promise.all([
      totalQuery.count(),
      completedQuery.count(),
      scheduledQuery.count(),
      cancelledQuery.count(),
      noShowQuery.count()
    ]);
    
    // Extract the count values and errors from results
    const [
      { count: total, error: totalError },
      { count: completed, error: completedError },
      { count: scheduled, error: scheduledError },
      { count: cancelled, error: cancelledError },
      { count: noShow, error: noShowError }
    ] = results;
    
    // Check for errors
    if (totalError) throw totalError;
    if (completedError) throw completedError;
    if (scheduledError) throw scheduledError;
    if (cancelledError) throw cancelledError;
    if (noShowError) throw noShowError;

    return {
      total: total || 0,
      completed: completed || 0,
      scheduled: scheduled || 0,
      cancelled: cancelled || 0,
      no_show: noShow || 0
    };
  } catch (error) {
    console.error("Error fetching status counts:", error);
    throw error;
  }
}
