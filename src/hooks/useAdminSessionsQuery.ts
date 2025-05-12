
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
        
        // Get total count for pagination
        const countQuery = query.count();
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
    // Start with a basic query
    let query = supabase
      .from("mentor_sessions")
      .select('status', { count: 'exact' });

    // Apply date filters if provided
    if (startDate) {
      query = query.gte("scheduled_at", startDate);
    }
    
    if (endDate) {
      query = query.lte("scheduled_at", endDate);
    }
    
    if (searchTerm && searchTerm.trim() !== '') {
      // Join with profiles for search
      query = query.or(`
        mentor.full_name.ilike.%${searchTerm}%,
        mentee.full_name.ilike.%${searchTerm}%,
        session_type.type.ilike.%${searchTerm}%
      `);
    }

    // Get the total first
    const { count: total, error: totalError } = await query;
    
    if (totalError) {
      throw totalError;
    }
    
    // Now get completed count
    const { count: completed, error: completedError } = await query
      .eq('status', 'completed');
      
    if (completedError) {
      throw completedError;
    }
    
    // Get scheduled count
    const { count: scheduled, error: scheduledError } = await query
      .eq('status', 'scheduled');
      
    if (scheduledError) {
      throw scheduledError;
    }
    
    // Get cancelled count
    const { count: cancelled, error: cancelledError } = await query
      .eq('status', 'cancelled');
      
    if (cancelledError) {
      throw cancelledError;
    }
    
    // Get no_show count
    const { count: noShow, error: noShowError } = await query
      .eq('status', 'no_show');
      
    if (noShowError) {
      throw noShowError;
    }

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
