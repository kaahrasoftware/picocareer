export interface MentorAvailability {
  id: string;
  profile_id: string | null;
  date_available: string;
  start_time: string;
  end_time: string;
  timezone: string;
  is_available: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface MentorSessionType {
  id: string;
  profile_id: string | null;
  type: string;
  duration: number;
  price: number;
  description: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface MentorSession {
  id: string;
  mentor_id: string | null;
  mentee_id: string | null;
  session_type_id: string | null;
  scheduled_at: string;
  status: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
}