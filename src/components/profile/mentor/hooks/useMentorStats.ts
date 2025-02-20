
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
        .select("*, session_type:mentor_session_types(duration)")
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

  // Fetch feedback and ratings
  const { data: feedbackResponse } = useQuery({
    queryKey: ["mentor-feedback", profileId],
    queryFn: async () => {
      if (!profileId) return null;

      const { data, error } = await supabase
        .from("session_feedback")
        .select("*")
        .eq("to_profile_id", profileId)
        .eq("feedback_type", "mentee_feedback");

      if (error) {
        console.error('Error fetching feedback:', error);
        throw error;
      }

      return data;
    },
    enabled: !!profileId
  });

  // Calculate stats
  const stats = (() => {
    if (sessionsResponse && feedbackResponse) {
      const sessions = sessionsResponse;
      const feedback = feedbackResponse;
      const now = new Date();
      
      const total_sessions = sessions.length;
      
      // Count completed sessions based on status and no-shows
      const completed_sessions = sessions.filter(s => {
        if (s.status === 'cancelled') return false;
        
        const sessionEndTime = new Date(s.scheduled_at);
        sessionEndTime.setMinutes(sessionEndTime.getMinutes() + (s.session_type?.duration || 60));
        
        // Only consider past sessions
        if (sessionEndTime >= now) return false;

        // Check if there's any feedback indicating the mentor didn't show up
        const mentorNoShow = feedback.some(f => 
          f.session_id === s.id && 
          f.to_profile_id === profileId && 
          f.did_not_show_up
        );

        // If mentor didn't show up, it's not completed
        if (mentorNoShow) return false;

        return s.status === 'completed';
      }).length;
      
      const upcoming_sessions = sessions.filter(s => {
        if (s.status === 'cancelled') return false;
        return new Date(s.scheduled_at) >= now;
      }).length;
      
      const cancelled_sessions = sessions.filter(s => s.status === 'cancelled').length;
      
      // Count no-shows by mentees (where mentor reported them as no-show)
      const no_show_sessions = feedback.filter(f => 
        f.from_profile_id === profileId && 
        f.did_not_show_up
      ).length;

      const unique_mentees = new Set(sessions.map(s => s.mentee_id)).size;
      
      // Calculate cancellation score (percentage of non-cancelled and non-no-show sessions)
      const total_scheduled = total_sessions - cancelled_sessions;
      const cancellation_score = total_scheduled > 0 
        ? Math.round(((total_scheduled - no_show_sessions) / total_scheduled) * 100)
        : 100;

      // Calculate total hours based on completed sessions only
      const totalMinutes = sessions.reduce((acc, session) => {
        // Skip if session was cancelled
        if (session.status === 'cancelled') return acc;
        
        // Skip if mentor was reported as no-show
        const mentorNoShow = feedback.some(f => 
          f.session_id === session.id && 
          f.to_profile_id === profileId && 
          f.did_not_show_up
        );
        if (mentorNoShow) return acc;
        
        const startTime = new Date(session.scheduled_at);
        const endTime = new Date(session.scheduled_at);
        endTime.setMinutes(endTime.getMinutes() + (session.session_type?.duration || 60));
        
        // Only include sessions that have ended
        if (endTime > now) return acc;
        
        // Calculate actual duration in minutes
        const durationInMs = endTime.getTime() - startTime.getTime();
        const durationInMinutes = Math.floor(durationInMs / (1000 * 60));
        
        return acc + durationInMinutes;
      }, 0);

      // Convert total minutes to hours and remaining minutes
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const timeStr = `${hours}h ${minutes}m`;

      // Calculate rating statistics from non-no-show sessions
      const validRatings = feedback.filter(f => 
        // Only include ratings where mentor showed up (not marked as no-show when they're the to_profile)
        !(f.to_profile_id === profileId && f.did_not_show_up) && 
        f.rating > 0
      );
      const total_ratings = validRatings.length;
      const average_rating = total_ratings > 0
        ? validRatings.reduce((acc, curr) => acc + curr.rating, 0) / total_ratings
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
          
          // Skip if mentor was reported as no-show
          const mentorNoShow = feedback.some(f => 
            f.session_id === session.id && 
            f.to_profile_id === profileId && 
            f.did_not_show_up
          );
          if (mentorNoShow) return false;
          
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
        cancelled_sessions,
        no_show_sessions,
        unique_mentees,
        total_hours: timeStr,
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
