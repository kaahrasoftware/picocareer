export type NotificationType = 
  | "major_update"
  | "session_booked"
  | "session_cancelled"
  | "session_reminder"
  | "mentor_request"
  | "system_update"
  | "profile_update";

export type NotificationCategory = 
  | "all"
  | "system"
  | "unread"
  | "session"
  | "mentorship"
  | "general"
  | "major_update";

export type MeetingPlatform = 
  | "Google Meet"
  | "Zoom"
  | "Microsoft Teams"
  | "Skype"
  | "Phone Call"
  | "In Person";

export interface Availability {
  id: string;
  profile_id: string;
  is_available: boolean;
  recurring: boolean;
  day_of_week?: number;
  start_date_time: string;
  end_date_time: string;
  timezone_offset: number;
  created_at?: string;
  updated_at?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  event_type: 'session' | 'webinar' | 'holiday';
  status?: string;
  session_details?: MentorSession;
}

export interface MentorSession {
  id: string;
  scheduled_at: string;
  status: string;
  notes?: string;
  meeting_link?: string;
  meeting_platform?: MeetingPlatform;
  mentor: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  mentee: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  session_type: {
    type: string;
    duration: number;
  };
}

export const getNotificationCategory = (type: NotificationType): NotificationCategory => {
  switch (type) {
    case "session_booked":
    case "session_cancelled":
    case "session_reminder":
    case "mentor_request":
      return "mentorship";
    case "major_update":
    case "system_update":
    case "profile_update":
      return "general";
    default:
      return "general";
  }
};