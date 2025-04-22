
export interface MentorPerformanceData {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  total_sessions: number;
  completed_sessions: number;
  cancelled_sessions: number;
  no_show_sessions: number;
  completion_rate: number;
  average_rating: number;
  total_mentees: number;
  total_hours: number;
  created_at: string;
}
