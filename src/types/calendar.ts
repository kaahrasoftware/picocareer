import { MeetingPlatform, SessionType } from "./session";
import { NotificationType } from "./notification";

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_date_time: string;
  end_date_time: string;
  event_type: string;
  status?: string;
  session_details?: {
    id: string;
    scheduled_at: string;
    status: string;
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
    meeting_platform?: MeetingPlatform;
    meeting_link?: string;
    attendance_confirmed?: boolean;
  };
}

export interface Availability {
  id: string;
  start_date_time: string;
  end_date_time: string;
  is_available: boolean;
  recurring: boolean;
  day_of_week?: number;
}

export type NotificationCategory = 
  | 'session'
  | 'major_update'
  | 'general';

export const getNotificationCategory = (type: NotificationType): NotificationCategory => {
  switch (type) {
    case 'session_booked':
    case 'session_cancelled':
    case 'session_reminder':
      return 'session';
    case 'major_update':
      return 'major_update';
    default:
      return 'general';
  }
};