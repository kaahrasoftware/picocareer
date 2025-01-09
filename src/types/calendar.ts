import { Database } from "@/integrations/supabase/types";
import { NotificationType, NotificationCategory, MeetingPlatform } from "./database/enums";

export interface MentorAvailability {
  id: string;
  profile_id: string;
  is_available: boolean;
  start_date_time: string;
  end_date_time: string;
  recurring: boolean;
  day_of_week: number | null;
  created_at: string;
  updated_at: string;
}

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
  session_details?: MentorSession;
}

export interface MentorSession {
  id: string;
  mentor_id: string;
  mentee_id: string;
  scheduled_at: string;
  status: string;
  notes: string | null;
  meeting_platform: MeetingPlatform;
  meeting_link: string | null;
  mentor: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
  mentee: {
    id: string;
    full_name: string;
    avatar_url: string;
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
      return "session";
    case "mentor_request":
      return "mentorship";
    case "system_update":
      return "system";
    default:
      return "general";
  }
};

export type { NotificationType, NotificationCategory, MeetingPlatform };