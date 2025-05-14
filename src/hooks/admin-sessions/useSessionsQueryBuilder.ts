
import { supabase } from "@/integrations/supabase/client";
import { MentorSession } from "@/types/database/session";
import { SessionQueryParams, SessionsQueryResult } from "./types";
import { fetchStatusCounts } from "./useSessionStatusCounts";

export async function buildSessionsQuery({
  statusFilter = "all",
  page = 1,
  pageSize = 10,
  startDate,
  endDate,
  searchTerm,
  sortBy = "scheduled_at",
  sortDirection = "desc"
}: SessionQueryParams): Promise<SessionsQueryResult> {
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
      .select("*", { count: "exact" });
      
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
    
    const countResult = await countQuery.count();
    const count = countResult.count || 0;
    
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
      totalCount: count,
      totalPages: Math.ceil(count / pageSize),
      statusCounts
    };
  } catch (error) {
    console.error("Error in useAdminSessionsQuery:", error);
    throw error;
  }
}
