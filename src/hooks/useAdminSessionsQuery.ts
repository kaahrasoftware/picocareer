
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { MentorSession } from "@/types/database/session";

export function useAdminSessionsQuery(statusFilter: string = "all") {
  return useQuery({
    queryKey: ["admin-sessions", statusFilter],
    queryFn: async () => {
      // Build the query
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
          ),
          attendance_confirmed
        `);
      
      // Apply status filter if not "all"
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }
      
      // Execute the query
      const { data, error } = await query.order('scheduled_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching sessions:", error);
        throw error;
      }
      
      return data as MentorSession[];
    },
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
}
