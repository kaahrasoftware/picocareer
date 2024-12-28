import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { MentorSession } from "@/types/database/session";

export function useSessionEvents(userId: string | undefined, startDate: Date, endDate: Date) {
  return useQuery({
    queryKey: ['session-events', userId, startDate, endDate],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('mentor_sessions')
        .select(`
          id,
          scheduled_at,
          status,
          notes,
          mentor:profiles!mentor_id(id, full_name),
          mentee:profiles!mentee_id(id, full_name),
          session_type:mentor_session_types(type, duration)
        `)
        .or(`mentor_id.eq.${userId},mentee_id.eq.${userId}`)
        .gte('scheduled_at', startDate.toISOString())
        .lte('scheduled_at', endDate.toISOString());

      if (error) throw error;

      return data.map(session => ({
        id: session.id,
        scheduled_at: session.scheduled_at,
        status: session.status,
        notes: session.notes,
        mentor: session.mentor,
        mentee: session.mentee,
        session_type: session.session_type[0]
      })) as MentorSession[];
    },
    enabled: !!userId,
  });
}