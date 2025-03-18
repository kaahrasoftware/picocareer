
// Define meeting platform options
export type MeetingPlatform = "Google Meet" | "WhatsApp" | "Telegram" | "Phone Call";

// Define availability type
export interface Availability {
  id: string;
  profile_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  created_at: string;
  is_available: boolean;
}

// Define calendar event type
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: "session" | "availability" | "unavailable";
  status?: "scheduled" | "completed" | "cancelled" | "no_show";
  menteeId?: string;
  menteeName?: string;
  menteeAvatar?: string;
  sessionTypeId?: string;
  sessionType?: string;
  sessionNote?: string;
  meeting_link?: string;
  meeting_platform?: MeetingPlatform;
  color?: string;
}

// Define mentor session type
export interface MentorSession {
  id: string;
  mentor_id: string;
  mentee_id: string;
  session_type_id: string;
  status: "scheduled" | "completed" | "cancelled" | "no_show";
  scheduled_at: string;
  meeting_link?: string;
  meeting_platform: MeetingPlatform;
  mentee_phone_number?: string;
  mentee_telegram_username?: string;
  note?: string;
  created_at: string;
  updated_at?: string;
  session_type?: {
    duration: number;
    type: string;
  };
}

// Define notification categories
export type NotificationCategory = 'general' | 'mentorship' | 'hub';

// Helper function to get notification category
export function getNotificationCategory(type?: string): NotificationCategory {
  if (!type) return 'general';
  
  // Map notification types to categories
  if (type.includes('session') || type.includes('mentor')) {
    return 'mentorship';
  } else if (type.includes('hub')) {
    return 'hub';
  }
  
  return 'general';
}
