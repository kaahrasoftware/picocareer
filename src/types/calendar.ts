import type { NotificationType, NotificationCategory, MeetingPlatform } from "./database/enums";
import type { SessionType } from "./database/session";
import type { Profile } from "./database/profiles";

export interface Availability {
  id: string;
  profile_id: string;
  is_available: boolean;
  recurring: boolean;
  day_of_week?: number;
  start_date_time: string;
  end_date_time: string;
  created_at: string;
  updated_at: string;
}

export interface SessionParticipant {
  id: string;
  full_name: string;
  avatar_url: string;
}

export interface SessionTypeDetails {
  type: SessionType;
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
  session_type?: SessionTypeDetails;
  meeting_link?: string | null;
  meeting_platform?: MeetingPlatform;
  attendance_confirmed?: boolean;
  availability_slot_id?: string | null;
  mentee_telegram_username?: string | null;
  mentee_phone_number?: string | null;
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
  session_details: MentorSession;
}

export type { MeetingPlatform, NotificationType, NotificationCategory };

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
    case "profile_update":
    case "major_update":
      return "general";
    default:
      return "general";
  }
};