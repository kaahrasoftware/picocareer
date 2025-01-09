export interface SessionType {
  id: string;
  type: string;
  duration: number;
  price: number;
  description: string | null;
}

export interface MentorAvailability {
  id: string;
  profile_id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  recurring: boolean;
  day_of_week: number | null;
}

export interface MentorsTables {
  mentor_availability: {
    Row: MentorAvailability;
    Insert: Omit<MentorAvailability, 'id' | 'created_at' | 'updated_at'>;
    Update: Partial<Omit<MentorAvailability, 'id'>>;
  }
  mentor_session_types: {
    Row: SessionType;
    Insert: Omit<SessionType, 'id'>;
    Update: Partial<Omit<SessionType, 'id'>>;
  }
}