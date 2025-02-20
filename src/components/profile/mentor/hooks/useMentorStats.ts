
import { useSessionQueries } from "./useSessionQueries";
import {
  calculateSessionStats,
  calculateTotalHours,
  calculateRatingStats,
  calculateMonthlyStats
} from "./utils/statsCalculator";
import type { MentorStatsHookReturn } from "./types";

export function useMentorStats(profileId: string | undefined): MentorStatsHookReturn {
  const {
    sessionsResponse,
    sessionTypes,
    feedbackResponse,
    refetchSessions,
    refetchSessionTypes
  } = useSessionQueries(profileId);

  // Calculate stats
  const stats = (() => {
    if (sessionsResponse && feedbackResponse) {
      const sessions = sessionsResponse;
      const feedback = feedbackResponse;
      const now = new Date();
      
      const sessionStats = calculateSessionStats(sessions, feedback, now);
      
      // Count no-shows by mentors (where mentee reported mentor as no-show)
      const no_show_sessions = feedback.filter(f => 
        f.to_profile_id === profileId && 
        f.did_not_show_up
      ).length;

      const unique_mentees = new Set(sessions.map(s => s.mentee_id)).size;
      
      // Calculate cancellation score
      const total_scheduled = sessionStats.total_sessions - sessionStats.cancelled_sessions;
      const cancellation_score = total_scheduled > 0 
        ? Math.round(((total_scheduled - no_show_sessions) / total_scheduled) * 100)
        : 100;

      const total_hours = calculateTotalHours(sessions, feedback, now);
      const { total_ratings, average_rating } = calculateRatingStats(feedback);
      const session_data = calculateMonthlyStats(sessions, feedback);

      return {
        ...sessionStats,
        no_show_sessions,
        unique_mentees,
        total_hours,
        total_ratings,
        average_rating,
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
