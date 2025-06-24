// Define meeting platform options
export type MeetingPlatform = "Google Meet" | "Zoom" | "Microsoft Teams" | "Telegram" | "WhatsApp" | "Phone Call";

// Define availability type
export interface Availability {
  id: string;
  profile_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  created_at: string;
  is_available: boolean;
  recurring?: boolean;
  start_date_time?: string;
  end_date_time?: string;
  timezone_offset?: number;
  reference_timezone?: string;
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
  start_time?: string;
  end_time?: string;
  description?: string;
  event_type?: string;
  session_details?: any;
  user_id?: string; // Added for tracking current user ID in SessionCard
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
  mentor?: any;
  mentee?: any;
  has_feedback?: boolean;
}

// Define notification categories
export type NotificationCategory = 'session' | 'availability' | 'payment' | 'profile' | 'general';

// Helper function to get notification category
export function getNotificationCategory(type: string): NotificationCategory {
  switch (type) {
    case 'session_booked':
    case 'session_cancelled':
    case 'session_reminder':
      return 'session';
    case 'availability_request':
      return 'availability';
    case 'payment_received':
    case 'payment_failed':
      return 'payment';
    case 'profile_updated':
      return 'profile';
    case 'general':
    default:
      return 'general';
  }
}

export interface NotificationData {
  id: string;
  recipient_id: string;
  title: string;
  message: string;
  type: NotificationCategory;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}
