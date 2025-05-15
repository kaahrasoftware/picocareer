
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MentorSession } from "@/types/database/session";

export function useAdminSessionsQuery(options?: { pageSize?: number; page?: number }) {
  const pageSize = options?.pageSize || 10;
  const page = options?.page || 1;
  const offset = (page - 1) * pageSize;
  
  return useQuery({
    queryKey: ["admin-sessions", page, pageSize],
    queryFn: async () => {
      const { data, error, count } = await supabase
        .from("mentor_sessions")
        .select(`
          *,
          mentor:profiles!mentor_sessions_mentor_id_fkey (id, full_name, email, avatar_url),
          mentee:profiles!mentor_sessions_mentee_id_fkey (id, full_name, email, avatar_url),
          session_type:mentor_session_types (id, type, duration, token_cost, price, custom_type_name)
        `, { count: "exact" })
        .order("scheduled_at", { ascending: false })
        .range(offset, offset + pageSize - 1);
      
      if (error) throw error;
      
      return {
        sessions: data as MentorSession[],
        totalCount: count || 0,
      };
    },
  });
}
