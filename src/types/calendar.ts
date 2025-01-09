export type MeetingPlatform = "Google Meet" | "WhatsApp" | "Telegram" | "Phone Call";

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
  mentor_id: string;
  mentee_id: string;
  session_type: {
    type: string;
    duration: number;
  };
  meeting_link?: string;
  meeting_platform?: MeetingPlatform;
}

export interface Availability {
  id: string;
  profile_id: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  recurring: boolean;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  event_type: "session";
  status: string;
  created_at: string;
  updated_at: string;
  session_details?: MentorSession;
}

export type NotificationCategory = "all" | "unread" | "session" | "system" | "mentorship" | "general";

export type NotificationType = 
  | "session_booked" 
  | "session_cancelled" 
  | "session_reminder" 
  | "profile_update" 
  | "mentor_request" 
  | "blog_posted" 
  | "major_update";

export function getNotificationCategory(type: NotificationType): NotificationCategory {
  switch (type) {
    case "session_booked":
    case "session_cancelled":
    case "session_reminder":
    case "mentor_request":
      return "mentorship";
    default:
      return "general";
  }
}