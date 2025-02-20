
import type { SessionType } from "@/types/session";

export interface MentorStats {
  total_sessions: number;
  completed_sessions: number;
  upcoming_sessions: number;
  cancelled_sessions: number;
  no_show_sessions: number;
  unique_mentees: number;
  total_hours: string;
  total_ratings: number;
  average_rating: number;
  cancellation_score: number;
  session_data: Array<{
    name: string;
    sessions: number;
  }>;
}

export interface MentorStatsHookReturn {
  stats: MentorStats | null;
  sessionTypes: SessionType[] | null;
  refetchSessions: () => void;
  refetchSessionTypes: () => void;
}
