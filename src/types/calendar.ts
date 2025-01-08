import type { MeetingPlatform, NotificationType } from "./database/enums";

export type { MeetingPlatform };

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
  meeting_platform?: MeetingPlatform;
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

export interface Availability {
  id: string;
  profile_id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
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