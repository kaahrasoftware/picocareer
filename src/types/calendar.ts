export type CalendarEvent = {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  event_type: string;
  created_at: string;
  updated_at: string;
  status?: string;
  session_details?: {
    id: string;
    scheduled_at: string;
    status: string;
    mentor_id: string;
    mentee_id: string;
    session_type: {
      duration: number;
      type: string;
    };
  };
};

export type Availability = {
  id: string;
  profile_id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  recurring: boolean;
  day_of_week: number | null;
  created_at: string;
  updated_at: string;
};

export type NotificationType = 
  | "session_booked"
  | "session_cancelled"
  | "session_reminder"
  | "profile_update"
  | "mentor_request"
  | "major_update"
  | "system_update"
  | "blog_posted";

export type NotificationCategory = 
  | "mentorship"
  | "general"
  | "session"
  | "system"
  | "major_update"
  | "unread"
  | "all";

export const getNotificationCategory = (type: NotificationType): NotificationCategory => {
  switch (type) {
    case "session_booked":
    case "session_cancelled":
    case "session_reminder":
      return "mentorship";
    case "profile_update":
    case "mentor_request":
      return "general";
    case "major_update":
      return "major_update";
    case "system_update":
      return "system";
    case "blog_posted":
      return "general";
    default:
      return "general";
  }
};

export type TimeSlot = {
  id: string;
  profile_id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  recurring: boolean;
  day_of_week: number | null;
  created_at: string;
  updated_at: string;
};