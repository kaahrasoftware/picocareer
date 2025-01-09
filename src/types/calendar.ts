import { Database } from "@/types/database/database.types";
import { MeetingPlatform, SessionType } from "./session";

export type MentorAvailability = Database["public"]["Tables"]["mentor_availability"]["Row"];
export type CalendarEvent = Database["public"]["Tables"]["calendar_events"]["Row"];

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