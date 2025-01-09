import type { MeetingPlatform } from "./database/enums";

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