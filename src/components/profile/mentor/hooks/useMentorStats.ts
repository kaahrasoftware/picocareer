
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useMentorStats(profileId: string | undefined) {
  // Fetch mentor sessions
  const { data: sessionsResponse, refetch: refetchSessions } = useQuery({
    queryKey: ["mentor-sessions", profileId],
    queryFn: async () => {
      if (!profileId) return null;
      
      console.log('Fetching sessions for mentor:', profileId);
      
      const { data, error } = await supabase
        .from("mentor_sessions")
        .select("*, session_type:mentor_session_types(duration), cancellation_details:session_feedback!inner(from_profile_id)")
        .eq("mentor_id", profileId);

      if (error) {
        console.error('Error fetching sessions:', error);
        throw error;
      }

      console.log('Fetched sessions:', data);
      return data;
    },
    enabled: !!profileId
  });

  // Fetch session types
  const { data: sessionTypes, refetch: refetchSessionTypes } = useQuery({
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

  // Fetch ratings
  const { data: ratingsResponse } = useQuery({
    queryKey: ["mentor-ratings", profileId],
    queryFn: async () => {
      if (!profileId) return null;

      const { data, error } = await supabase
        .from("session_feedback")
        .select("rating")
        .eq("to_profile_id", profileId)
        .eq("feedback_type", "mentee_feedback");

      if (error) {
        console.error('Error fetching ratings:', error);
        throw error;
      }

      return data;
    },
    enabled: !!profileId
  });

  // Calculate stats
  const stats = (() => {
    if (sessionsResponse) {
      const sessions = sessionsResponse;
      const now = new Date();
      
      const total_sessions = sessions.length;
      
      // Count completed sessions: sessions that have passed their end time and weren't cancelled
      const completed_sessions = sessions.filter(s => {
        if (s.status === 'cancelled') return false;
        
        const sessionEndTime = new Date(s.scheduled_at);
        // Add session duration to get end time
        sessionEndTime.setMinutes(sessionEndTime.getMinutes() + (s.session_type?.duration || 60));
        
        return sessionEndTime < now;
      }).length;
      
      const upcoming_sessions = sessions.filter(s => {
        if (s.status === 'cancelled') return false;
        return new Date(s.scheduled_at) >= now;
      }).length;
      
      // Count only sessions cancelled by the mentor
      const mentor_cancelled_sessions = sessions.filter(s => 
        s.status === 'cancelled' && s.cancellation_details?.from_profile_id === profileId
      ).length;

      const unique_mentees = new Set(sessions.map(s => s.mentee_id)).size;
      
      // Calculate cancellation score based only on mentor cancellations
      const cancellation_score = total_sessions > 0 
        ? Math.round(((total_sessions - mentor_cancelled_sessions) / total_sessions) * 100)
        : 100;

      // Calculate total hours based on session types
      const total_hours = sessions.reduce((acc, session) => {
        if (session.status === 'cancelled') return acc;
        const sessionType = sessionTypes?.find(st => st.id === session.session_type_id);
        return acc + (sessionType?.duration || 60) / 60;
      }, 0);

      // Calculate rating statistics
      const ratings = ratingsResponse || [];
      const total_ratings = ratings.length;
      const average_rating = total_ratings > 0
        ? ratings.reduce((acc, curr) => acc + (curr.rating || 0), 0) / total_ratings
        : 0;

      // Calculate session data for the last 6 months
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
          if (session.status === 'cancelled') return false;
          const sessionDate = new Date(session.scheduled_at);
          return sessionDate.getMonth() === month.date.getMonth() &&
                 sessionDate.getFullYear() === month.date.getFullYear();
        }).length;
        return {
          name: month.name,
          sessions: count
        };
      });

      return {
        total_sessions,
        completed_sessions,
        upcoming_sessions,
        cancelled_sessions: mentor_cancelled_sessions, // Update to use mentor cancellations
        unique_mentees,
        total_hours,
        total_ratings,
        average_rating: Number(average_rating.toFixed(1)),
        cancellation_score,
        session_data
      };
    }
    return null;
  })();

  return {
    stats,
    sessionTypes,
    refetchSessions,
    refetchSessionTypes
  };
}
