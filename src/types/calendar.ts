import type { MeetingPlatform, NotificationType } from "./database/enums";

export type { MeetingPlatform };

export interface SessionType {
  type: string;
  duration: number;
}

export interface MentorSession {
  id: string;
  scheduled_at: string;
  status: string;
  notes?: string;
  meeting_platform?: MeetingPlatform;
  meeting_link?: string;
  session_type: SessionType;
  mentor: {
    full_name: string;
  };
  mentee: {
    full_name: string;
  };
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  event_type: "session";
  status: string;
  session_details?: MentorSession;
  created_at: string;
  updated_at: string;
}

export interface Availability {
  id: string;
  profile_id: string;
  is_available: boolean;
  start_time: string;
  end_time: string;
  recurring?: boolean;
  day_of_week?: number;
  created_at?: string;
  updated_at?: string;
}

export type NotificationCategory = "mentorship" | "general";

export const getNotificationCategory = (type: NotificationType): NotificationCategory => {
  const mentorshipTypes = [
    "session_booked",
    "session_cancelled",
    "session_reminder",
    "session_feedback"
  ];

  return mentorshipTypes.includes(type) ? "mentorship" : "general";
};