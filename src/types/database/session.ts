
export interface SessionParticipant {
  id: string;
  full_name: string;
  avatar_url?: string | null;
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
  note?: string; // Added for compatibility
  mentor: SessionParticipant;
  mentee: SessionParticipant;
  session_type: SessionType;
  meeting_link?: string | null;
  meeting_platform?: 'Google Meet' | 'WhatsApp' | 'Telegram' | 'Phone Call';
  attendance_confirmed?: boolean;
  availability_slot_id?: string | null;
}
