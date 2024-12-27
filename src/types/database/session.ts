export interface SessionParticipant {
  id: string;
  full_name: string;
}

export interface SessionType {
  type: string;
  duration: number;
}

export interface MentorSession {
  id: string;
  scheduled_at: string;
  status: string;
  notes: string | null;
  mentor: SessionParticipant;
  mentee: SessionParticipant;
  session_type: SessionType;
  meeting_link?: string | null;
  meeting_platform?: 'google_meet' | 'whatsapp' | 'telegram';
  attendance_confirmed?: boolean;
}