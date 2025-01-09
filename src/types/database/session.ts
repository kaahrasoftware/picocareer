export interface SessionParticipant {
  id: string;
  full_name: string;
  avatar_url: string;
}

export interface SessionType {
  type: string;
  duration: number;
}

export interface MentorSession {
  id: string;
  mentor_id: string;
  mentee_id: string;
  session_type_id: string;
  scheduled_at: string;
  status: string;
  notes: string | null;
  mentor?: SessionParticipant;
  mentee?: SessionParticipant;
  session_type?: SessionType;
  meeting_link?: string | null;
  meeting_platform?: 'google_meet' | 'whatsapp' | 'telegram' | 'phone_call';
  attendance_confirmed?: boolean;
  availability_slot_id?: string | null;
  mentee_telegram_username?: string | null;
  mentee_phone_number?: string | null;
}