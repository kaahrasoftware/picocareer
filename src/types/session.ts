import { Control as FormControl } from "react-hook-form";

export type MeetingPlatform = 'Google Meet' | 'Zoom' | 'Microsoft Teams' | 'Skype' | 'Phone' | 'In Person';

export interface Availability {
  id: string;
  profile_id: string;
  is_available: boolean;
  recurring: boolean;
  day_of_week: number;
  start_time: string;
  end_time: string;
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

export interface SessionTypeFormData {
  type: string;
  duration: number;
  price: number;
  description: string;
  meeting_platform: MeetingPlatform[];
  telegram_username?: string;
  phone_number?: string;
  token_cost: number;
}

export type Control = FormControl<SessionTypeFormData>;

export type NotificationType = 
  | 'major_update'
  | 'session_booked'
  | 'session_cancelled'
  | 'session_reminder'
  | 'mentor_request'
  | 'system_update'
  | 'profile_update'
  | 'token_purchase';

export type NotificationCategory = 
  | 'all'
  | 'system'
  | 'unread'
  | 'session'
  | 'mentorship'
  | 'general'
  | 'major_update';