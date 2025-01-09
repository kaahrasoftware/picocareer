import type { MeetorSession } from "./database/session";
import type { NotificationType, NotificationCategory } from "./database/enums";

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

export interface MentorSession {
  id: string;
  mentor_id: string;
  mentee_id: string;
  session_type_id: string;
  scheduled_at: string;
  notes?: string;
  meeting_platform: MeetingPlatform;
  meeting_link?: string;
  calendar_event_id?: string;
  status: string;
  attendance_confirmed: boolean;
  calendar_event_etag?: string;
  last_calendar_sync?: string;
  availability_slot_id?: string;
  mentee_telegram_username?: string;
  mentee_phone_number?: string;
  mentor?: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
  mentee?: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
  session_type?: {
    type: SessionType;
    duration: number;
  };
}

export type MeetingPlatform = 
  | "Google Meet"
  | "WhatsApp"
  | "Telegram"
  | "Phone Call";

export type SessionType =
  | "Know About my Career"
  | "Resume/CV Review"
  | "Campus France"
  | "Undergrad Application"
  | "Grad Application"
  | "TOEFL Exam Prep Advice"
  | "IELTS Exam Prep Advice"
  | "Duolingo Exam Prep Advice"
  | "SAT Exam Prep Advise"
  | "ACT Exam Prep Advice"
  | "GRE Exam Prep Advice"
  | "GMAT Exam Prep Advice"
  | "MCAT Exam Prep Advice"
  | "LSAT Exam Prep Advice"
  | "DAT Exam Prep Advice"
  | "Advice for PhD Students"
  | "How to Find Grants/Fellowships"
  | "Grant Writing Guidance"
  | "Interview Prep"
  | "How to Succeed as a College Student"
  | "Investment Strategies"
  | "Study Abroad Programs"
  | "Tips for F-1 Students"
  | "College Application Last Review"
  | "Application Essays Review"
  | "I need someone to practice my presentation with"
  | "Study Tips"
  | "Volunteer Opportunities"
  | "Know About my Academic Major";

export function getNotificationCategory(type: NotificationType): NotificationCategory {
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
}

export type { NotificationType, NotificationCategory };