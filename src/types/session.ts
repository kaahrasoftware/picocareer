import { Control } from "react-hook-form";
import { Database } from "@/integrations/supabase/types";

export type MeetingPlatform = Database["public"]["Enums"]["meeting_platform"];

export interface Availability {
  id: string;
  profile_id: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  recurring: boolean;
  day_of_week: number | null;
  start_time: string | null;
  end_time: string | null;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  event_type: string;
  created_at: string;
  updated_at: string;
  status?: string;
  session_details?: SessionDetails;
}

export interface SessionDetails {
  id: string;
  scheduled_at: string;
  status: string;
  mentor_id: string;
  mentee_id: string;
  session_type: SessionType;
}

export interface SessionType {
  id: string;
  type: SessionTypeEnum;
  duration: number;
  price: number;
  description?: string;
  meeting_platform: MeetingPlatform[];
}

export type SessionTypeEnum = Database["public"]["Enums"]["session_type"];

export interface SessionTypeFormData {
  type: SessionTypeEnum;
  duration: number;
  price: number;
  description: string;
  meeting_platform: MeetingPlatform[];
}

export interface CalendarTabProps {
  profile: Database["public"]["Tables"]["profiles"]["Row"];
}