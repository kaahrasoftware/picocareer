
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { MentorSession } from "@/types/database/session";

interface SessionQueryParams {
  statusFilter?: string;
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

interface StatusCounts {
  total: number;
  completed: number;
  scheduled: number;
  cancelled: number;
  no_show: number;
}

export function useAdminSessionsQuery({
  statusFilter = "all",
  page = 1,
  pageSize = 10,
  startDate,
  endDate,
  searchTerm,
  sortBy = "scheduled_at",
  sortDirection = "desc"
}: SessionQueryParams = {}) {
  return useQuery({
    queryKey: ["admin-sessions", statusFilter, page, pageSize, startDate, endDate, searchTerm, sortBy, sortDirection],
    queryFn: async () => {
      try {
        // Fetch status counts first - independent of pagination/filtering
        const statusCountsPromise = fetchStatusCounts(startDate, endDate, searchTerm);
        
        // Build data query
        let query = supabase
          .from("mentor_sessions")
          .select(`
            id,
            scheduled_at,
            status,
            notes,
            meeting_link,
            meeting_platform,
            mentor:profiles!mentor_sessions_mentor_id_fkey(
              id,
              full_name,
              avatar_url
            ),
            mentee:profiles!mentor_sessions_mentee_id_fkey(
              id,
              full_name,
              avatar_url
            ),
            session_type:mentor_session_types!mentor_sessions_session_type_id_fkey(
              type,
              duration
            )
          `);
        
        // Apply filters
        if (statusFilter !== "all") {
          query = query.eq("status", statusFilter);
        }
        
        if (startDate) {
          query = query.gte("scheduled_at", startDate);
        }
        
        if (endDate) {
          query = query.lte("scheduled_at", endDate);
        }
        
        if (searchTerm && searchTerm.trim() !== '') {
          // Using additional join for search
          query = query.or(`
              mentor.full_name.ilike.%${searchTerm}%,
              mentee.full_name.ilike.%${searchTerm}%,
              session_type.type.ilike.%${searchTerm}%
            `);
        }
        
        // Apply sorting
        query = query.order(sortBy, { ascending: sortDirection === 'asc' });
        
        // Get total count for pagination for the filtered query
        const countQuery = supabase
          .from("mentor_sessions")
          .select("*", { count: "exact", head: true });
          
        // Apply the same filters to the count query
        if (statusFilter !== "all") {
          countQuery.eq("status", statusFilter);
        }
        
        if (startDate) {
          countQuery.gte("scheduled_at", startDate);
        }
        
        if (endDate) {
          countQuery.lte("scheduled_at", endDate);
        }
        
        if (searchTerm && searchTerm.trim() !== '') {
          // For the count query, we need to use a join and or statements
          countQuery.or(`
            mentor_id.in.(select id from profiles where full_name ilike '%${searchTerm}%'),
            mentee_id.in.(select id from profiles where full_name ilike '%${searchTerm}%')
          `);
        }
        
        const { count, error: countError } = await countQuery;
        
        if (countError) {
          throw countError;
        }
        
        // Apply pagination
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);
        
        // Execute query
        const { data, error } = await query;
        
        if (error) {
          console.error("Error fetching sessions:", error);
          throw error;
        }

        // Wait for status counts
        const statusCounts = await statusCountsPromise;
        
        return {
          sessions: data as MentorSession[],
          totalCount: count || 0,
          totalPages: Math.ceil((count || 0) / pageSize),
          statusCounts
        };
      } catch (error) {
        console.error("Error in useAdminSessionsQuery:", error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
}

// Helper function to fetch counts by status
async function fetchStatusCounts(startDate?: string, endDate?: string, searchTerm?: string): Promise<StatusCounts> {
  try {
    // Create base query builder to apply the same filters
    const createBaseQuery = () => {
      let query = supabase.from("mentor_sessions").select("*", { count: "exact", head: true });
      
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
    
    // Execute all queries in parallel
    const [
      { count: total, error: totalError },
      { count: completed, error: completedError },
      { count: scheduled, error: scheduledError },
      { count: cancelled, error: cancelledError },
      { count: noShow, error: noShowError }
    ] = await Promise.all([
      totalQuery,
      completedQuery,
      scheduledQuery,
      cancelledQuery,
      noShowQuery
    ]);
    
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
