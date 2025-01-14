import { type Session } from "@supabase/supabase-js";
import { type Database } from "@/integrations/supabase/types";

export type NotificationType = Database["public"]["Enums"]["notification_type"];
export type NotificationCategory = "mentorship" | "general";

export interface Availability {
  id: string;
  profile_id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  recurring: boolean;
  day_of_week?: number;
  created_at: string;
  updated_at: string;
}

export interface TimeSlot {
  id: string;
  profile_id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  recurring: boolean;
  day_of_week?: number;
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
  created_at: string;
  updated_at: string;
  status?: string;
  session_details?: MentorSession;
}

export interface MentorSession {
  id: string;
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

export type MeetingPlatform = "Google Meet" | "WhatsApp" | "Telegram" | "Phone Call" | "Zoom";

export const getNotificationCategory = (type: NotificationType): NotificationCategory => {
  switch (type) {
    case "session_reminder":
    case "session_cancelled":
    case "session_booked":
    case "session_rescheduled":
      return "mentorship";
    case "system_update":
    case "maintenance":
    case "major_update":
    case "profile_update":
    case "mentor_request":
      return "general";
    default:
      return "general";
  }
};