export interface SessionType {
  type: string;
  duration: number;
}

export interface SessionParticipant {
  id: string;
  full_name: string;
}

export interface MentorSession {
  id: string;
  scheduled_at: string;
  status?: string;
  notes: string | null;
  mentor: SessionParticipant;
  mentee: SessionParticipant;
  session_type: SessionType;
  meeting_link?: string | null;
  meeting_platform?: 'google_meet' | 'whatsapp' | 'telegram';
  attendance_confirmed?: boolean;
  availability_slot_id?: string | null;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  event_type: 'session';
  status?: string;
  notes?: string | null;
  session_details?: MentorSession;
}

export interface Availability {
  id: string;
  profile_id: string;
  start_date_time: string;
  end_date_time: string;
  is_available: boolean;
  recurring?: boolean;
  day_of_week?: number;
}