export interface SessionType {
  type: "Introduction" | "Quick-Advice" | "Walkthrough" | "Group (2-3 Mentees)" | "Group (4-6 Mentees)";
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