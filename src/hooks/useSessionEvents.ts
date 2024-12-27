import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { MentorSession } from "@/types/database/session";

export function useSessionEvents(date: Date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return useQuery({
    queryKey: ['session-events', date.toISOString()],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('mentor_sessions')
        .select(`
          id,
          scheduled_at,
          notes,
          mentor:profiles!mentor_sessions_mentor_id_fkey(id, full_name),
          mentee:profiles!mentor_sessions_mentee_id_fkey(id, full_name),
          session_type:mentor_session_types(type, duration)
        `)
        .gte('scheduled_at', startOfDay.toISOString())
        .lte('scheduled_at', endOfDay.toISOString())
        .or(`mentor_id.eq.${user.id},mentee_id.eq.${user.id}`);

      if (error) throw error;
      return data as MentorSession[];
    },
    enabled: !!date,
  });
}