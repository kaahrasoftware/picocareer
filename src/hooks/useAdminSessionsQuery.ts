
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
        // Build count query first to get total
        let countQuery = supabase
          .from("mentor_sessions")
          .select("id", { count: "exact" });
        
        // Apply filters to count query
        if (statusFilter !== "all") {
          countQuery = countQuery.eq("status", statusFilter);
        }
        
        if (startDate) {
          countQuery = countQuery.gte("scheduled_at", startDate);
        }
        
        if (endDate) {
          countQuery = countQuery.lte("scheduled_at", endDate);
        }
        
        if (searchTerm && searchTerm.trim() !== '') {
          // Join with profiles to search by mentor or mentee name
          countQuery = countQuery.or(
            `mentor.full_name.ilike.%${searchTerm}%,mentee.full_name.ilike.%${searchTerm}%`
          );
        }
        
        // Execute count query
        const { count, error: countError } = await countQuery;
        
        if (countError) {
          throw countError;
        }
        
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
        
        return {
          sessions: data as MentorSession[],
          totalCount: count || 0,
          totalPages: Math.ceil((count || 0) / pageSize)
        };
      } catch (error) {
        console.error("Error in useAdminSessionsQuery:", error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
}
