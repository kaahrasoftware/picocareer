export type MeetingPlatform = "Google Meet" | "WhatsApp" | "Telegram" | "Phone Call";

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
  session_details?: {
    id: string;
    scheduled_at: string;
    status: string;
    mentor_id: string;
    mentee_id: string;
    session_type: {
      type: string;
      duration: number;
    };
  };
}

export type NotificationCategory = "all" | "unread" | "session" | "system";

export function getNotificationCategory(type: string): NotificationCategory {
  switch (type) {
    case "session_reminder":
    case "session_update":
      return "session";
    case "system_update":
    case "maintenance":
      return "system";
    default:
      return "all";
  }
}