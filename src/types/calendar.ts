import { Database } from "@/types/database/database.types";
import { MeetingPlatform, SessionType } from "./session";

export type MentorAvailability = {
  id: string;
  start_date_time: string;
  end_date_time: string;
  is_available: boolean;
  recurring: boolean;
  day_of_week?: number;
};

export type CalendarEvent = {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  event_type: string;
};

export interface MentorSession {
  id: string;
  scheduled_at: string;
  status: string;
  notes: string | null;
  mentor: {
    id: string;
    full_name: string;
  };
  mentee: {
    id: string;
    full_name: string;
  };
  session_type: {
    type: SessionType;
    duration: number;
  };
  meeting_link?: string | null;
  meeting_platform?: MeetingPlatform;
  attendance_confirmed?: boolean;
  availability_slot_id?: string | null;
}

export interface Availability {
  id: string;
  start_date_time: string;
  end_date_time: string;
  is_available: boolean;
  recurring: boolean;
  day_of_week?: number;
}

export const getNotificationCategory = (type: string): string => {
  switch (type) {
    case 'session_booked':
    case 'session_cancelled':
    case 'session_reminder':
      return 'session';
    case 'major_approved':
    case 'major_rejected':
      return 'major_update';
    default:
      return 'general';
  }
};