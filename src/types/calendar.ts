import { type MeetingPlatform, type SessionType } from './database/enums';

export interface TimeSlot {
  id: string;
  profile_id: string;
  recurring: boolean;
  day_of_week: number;
  start_date_time: string;
  end_date_time: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface Availability extends TimeSlot {}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  event_type: 'session' | 'holiday' | 'webinar';
  status: string;
  created_at: string;
  updated_at: string;
  session_details?: MentorSession;
}

export interface MentorSession {
  id: string;
  mentor_id: string;
  mentee_id: string;
  scheduled_at: string;
  status: string;
  notes: string;
  meeting_link: string;
  mentor: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
  mentee: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
  session_type: {
    id: string;
    type: SessionType;
    duration: number;
    price: number;
    meeting_platform: MeetingPlatform[];
  };
}

export interface NotificationCategory {
  id: string;
  name: string;
  description: string;
}

export const getNotificationCategory = (type: string): string => {
  switch (type) {
    case 'session_reminder':
      return 'Session';
    case 'profile_update':
      return 'Profile';
    case 'system_update':
      return 'System';
    default:
      return 'General';
  }
};

export type { MeetingPlatform };