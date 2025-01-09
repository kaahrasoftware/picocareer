export type MeetingPlatform = "Google Meet" | "WhatsApp" | "Telegram" | "Phone Call";

export interface SessionType {
  type: string;
  duration: number;
}

export interface SessionParticipant {
  id: string;
  full_name: string;
  avatar_url?: string;
}

export interface MentorSession {
  id: string;
  scheduled_at: string;
  status: string;
  notes: string | null;
  mentor: SessionParticipant;
  mentee: SessionParticipant;
  session_type: SessionType;
  meeting_link?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  event_type: 'session';
  status?: string;
  created_at: string;
  updated_at: string;
  session_details?: MentorSession;
}

export type NotificationType = 
  | "session_booked" 
  | "session_cancelled" 
  | "session_reminder" 
  | "profile_update" 
  | "mentor_request" 
  | "blog_posted" 
  | "major_update";

export type NotificationCategory = "mentorship" | "general";

export const getNotificationCategory = (type: NotificationType): NotificationCategory => {
  const mentorshipTypes = ["session_booked", "session_cancelled", "session_reminder", "mentor_request"];
  return mentorshipTypes.includes(type) ? "mentorship" : "general";
};