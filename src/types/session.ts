import { Control as FormControl } from "react-hook-form";

export type MeetingPlatform = 'Google Meet' | 'WhatsApp' | 'Telegram' | 'Phone Call';

export interface Availability {
  id: string;
  profile_id: string;
  is_available: boolean;
  recurring: boolean;
  day_of_week: number;
  start_date_time: string;
  end_date_time: string;
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
  session_details?: {
    id: string;
    scheduled_at: string;
    status: string;
    notes: string | null;
    meeting_link: string | null;
    mentor: {
      id: string;
      full_name: string;
      avatar_url: string | null;
    };
    mentee: {
      id: string;
      full_name: string;
      avatar_url: string | null;
    };
    session_type: {
      type: string;
      duration: number;
    };
  };
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
  | 'blog_posted';

export type NotificationCategory = 
  | 'all'
  | 'system'
  | 'unread'
  | 'session'
  | 'mentorship'
  | 'general'
  | 'major_update';

export type SessionTypeEnum = 
  | 'Know About my Career'
  | 'Mock Interview'
  | 'Resume Review'
  | 'Portfolio Review'
  | 'General Mentorship'
  | 'Technical Discussion'
  | 'Project Feedback'
  | 'Study Planning'
  | 'Exam Preparation'
  | 'Industry Insights';

export const SESSION_TYPE_OPTIONS: SessionTypeEnum[] = [
  'Know About my Career',
  'Mock Interview',
  'Resume Review',
  'Portfolio Review',
  'General Mentorship',
  'Technical Discussion',
  'Project Feedback',
  'Study Planning',
  'Exam Preparation',
  'Industry Insights'
];

export interface TimeSlot {
  id: string;
  profile_id: string;
  is_available: boolean;
  recurring: boolean;
  day_of_week: number;
  start_date_time: string;
  end_date_time: string;
  created_at: string;
  updated_at: string;
}

export interface CalendarViewProps {
  isMentor: boolean;
}

export interface EventsSidebarProps {
  selectedDate: Date;
  events: CalendarEvent[];
  isMentor: boolean;
  onEventClick?: (event: CalendarEvent) => void;
  onEventDelete?: (event: CalendarEvent) => void;
}

export interface TimeSlotFormProps {
  profileId: string;
  handleSubmit: (newSlot: Partial<TimeSlot>) => Promise<void>;
  onCancel: () => void;
}

export interface UnavailableTimeFormProps {
  profileId: string;
  handleSubmit: (newSlot: Partial<TimeSlot>) => Promise<void>;
  onCancel: () => void;
}

export interface AvailabilityManagerProps {
  profileId: string;
  handleUpdate?: () => Promise<void>;
}