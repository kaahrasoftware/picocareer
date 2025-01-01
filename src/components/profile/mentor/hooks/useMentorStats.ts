import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useMentorStats(profileId: string | undefined) {
  // Fetch mentor sessions
  const { data: sessionsResponse, refetch: refetchSessions } = useQuery({
    queryKey: ["mentor-sessions", profileId],
    queryFn: async () => {
      if (!profileId) return null;
      
      const { data, error } = await supabase
        .from("mentor_sessions")
        .select(`
          id,
          scheduled_at,
          status,
          session_type_id,
          mentee_id,
          session_type:mentor_session_types(
            duration
          )
        `)
        .eq("mentor_id", profileId);

      if (error) throw error;
      return data;
    },
    enabled: !!profileId
  });

  // Fetch session types
  const { data: sessionTypesResponse, refetch: refetchSessionTypes } = useQuery({
    queryKey: ["session-types", profileId],
    queryFn: async () => {
      if (!profileId) return null;

      const { data, error } = await supabase
        .from("mentor_session_types")
        .select("*")
        .eq("profile_id", profileId);

      if (error) throw error;
      return data;
    },
    enabled: !!profileId
  });

  // Calculate stats
  const stats = (() => {
    if (sessionsResponse && sessionTypesResponse) {
      const sessions = sessionsResponse;
      const now = new Date();
      
      const completed_sessions = sessions.filter(s => s.status === 'completed').length;
      const upcoming_sessions = sessions.filter(s => new Date(s.scheduled_at) >= now).length;
      const cancelled_sessions = sessions.filter(s => s.status === 'cancelled').length;
      const unique_mentees = new Set(sessions.map(s => s.mentee_id)).size;
      
      const total_hours = sessions.reduce((acc, session) => {
        return acc + (session.session_type?.duration || 60) / 60;
      }, 0);

      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return {
          name: date.toLocaleString('default', { month: 'short' }),
          date: date,
          sessions: 0
        };
      }).reverse();

      const session_data = last6Months.map(month => {
        const count = sessions.filter(session => {
          const sessionDate = new Date(session.scheduled_at);
          return sessionDate.getMonth() === month.date.getMonth() &&
                 sessionDate.getFullYear() === month.date.getFullYear();
        }).length;
        return {
          name: month.name,
          sessions: count
        };
      });

      const total_sessions = sessions.length;

      return {
        total_sessions,
        completed_sessions,
        upcoming_sessions,
        cancelled_sessions,
        unique_mentees,
        total_hours,
        session_data
      }
    }
    return null;
  })();

  return {
    stats,
    refetchSessions,
    refetchSessionTypes
  };
}