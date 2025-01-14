export type MeetingPlatform = "Google Meet" | "Phone Call" | "WhatsApp" | "Telegram" | "Zoom";

export interface TimeSlot {
  id: string;
  profile_id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  recurring: boolean;
  day_of_week?: number | null;
  created_at: string;
  updated_at: string;
}

export interface Availability extends TimeSlot {}

export type NotificationCategory = "major_update" | "mentorship" | "general" | "session" | "system" | "unread" | "all";

export type NotificationType = 
  | "session_booked"
  | "session_cancelled"
  | "session_reminder"
  | "profile_update"
  | "mentor_request"
  | "major_update"
  | "system_update";

export const getNotificationCategory = (type: NotificationType): NotificationCategory => {
  switch (type) {
    case "session_booked":
    case "session_cancelled":
    case "session_reminder":
      return "session";
    case "profile_update":
    case "mentor_request":
      return "mentorship";
    case "major_update":
      return "major_update";
    case "system_update":
      return "system";
    default:
      return "general";
  }
};

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  event_type: string;
  status: string;
  created_at: string;
  updated_at: string;
  session_details?: {
    id: string;
    scheduled_at: string;
    status: string;
    notes: string;
    meeting_link: string;
    mentor: {
      id: string;
      full_name: string;
      avatar_url: string | null;
    };
    mentee: {
      id: string;
      full_name: string;
      avatar_url: string | null;
    };
    session_type: {
      type: string;
      duration: number;
    };
  };
}