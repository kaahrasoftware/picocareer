
// Consolidated MeetingPlatform type to match the session types
export type MeetingPlatform = "Google Meet" | "WhatsApp" | "Telegram" | "Phone Call" | "Zoom" | "Microsoft Teams";

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  start_time: string; // Added for compatibility
  end_time: string; // Added for compatibility
  description?: string;
  location?: string;
  attendees?: string[];
  meetingPlatform?: MeetingPlatform;
  meetingLink?: string;
  status?: string; // Added for session status
  event_type?: 'session' | 'availability' | 'other'; // Added for event categorization
  user_id?: string; // Added for user identification
  session_details?: {
    mentor: { id: string; full_name: string; avatar_url?: string };
    mentee: { id: string; full_name: string; avatar_url?: string };
    session_type: { type: string; duration: number };
    meeting_link?: string;
    meeting_platform?: MeetingPlatform;
    has_feedback?: boolean;
  };
}

export interface TimeSlot {
  time: string;
  available: boolean;
  timezoneOffset?: number;
}

export interface Availability {
  id: string;
  profile_id: string;
  is_available?: boolean;
  created_at: string;
  updated_at: string;
  recurring?: boolean;
  day_of_week?: number;
  start_date_time: string;
  end_date_time: string;
  timezone_offset: number;
}

export interface MentorSession {
  id: string;
  mentor_id: string;
  mentee_id: string;
  session_type_id: string;
  scheduled_at: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  meeting_platform?: MeetingPlatform;
  meeting_link?: string;
  calendar_event_id?: string;
  status?: string;
  attendance_confirmed?: boolean;
  calendar_event_etag?: string;
  last_calendar_sync?: string;
  availability_slot_id?: string;
  mentee_telegram_username?: string;
  mentee_phone_number?: string;
}

// Notification types
export type NotificationCategory = 'session' | 'system' | 'hub_invite' | 'general';

export function getNotificationCategory(type?: string): NotificationCategory {
  if (!type) return 'general';
  
  if (type.includes('session') || type.includes('booking') || type.includes('reminder')) {
    return 'session';
  }
  
  if (type.includes('hub_invite') || type.includes('invite')) {
    return 'hub_invite';
  }
  
  if (type.includes('system') || type.includes('admin')) {
    return 'system';
  }
  
  return 'general';
}
