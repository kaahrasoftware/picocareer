export type MeetingPlatform = "Google Meet";

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  event_type: "session" | "holiday" | "webinar";
  status: string;
  session_details?: {
    id: string;
    scheduled_at: string;
    status: string;
    notes: string;
    meeting_link: string;
    mentor: {
      id: string;
      full_name: string;
      avatar_url?: string;
    };
    mentee: {
      id: string;
      full_name: string;
      avatar_url?: string;
    };
    session_type: {
      type: string;
      duration: number;
    };
  };
}

export interface Availability {
  id: string;
  profile_id: string;
  start_date_time: string;
  end_date_time: string;
  is_available: boolean;
  recurring: boolean;
  day_of_week?: number;
  timezone_offset: number;
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
  status: string;
  calendar_event_id?: string;
  availability_slot_id?: string;
}