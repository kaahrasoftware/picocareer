import { Control } from "react-hook-form";

export interface SessionParticipant {
  id: string;
  full_name: string;
  avatar_url?: string;
}

export interface SessionType {
  type: string;
  duration: number;
}

export interface MentorSession {
  id: string;
  scheduled_at: string;
  status: string;
  notes?: string;
  meeting_link?: string;
  mentor: SessionParticipant;
  mentee: SessionParticipant;
  session_type: SessionType;
  meeting_platform?: 'google_meet' | 'whatsapp' | 'telegram';
  attendance_confirmed?: boolean;
  availability_slot_id?: string;
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
  session_details?: MentorSession;
}

export type NotificationType =
  | 'major_update'
  | 'session_booked'
  | 'session_cancelled'
  | 'session_reminder'
  | 'mentor_request'
  | 'system_update'
  | 'profile_update';

export type NotificationCategory = 
  | 'all'
  | 'system'
  | 'unread'
  | 'session'
  | 'mentorship'
  | 'general'
  | 'major_update';

export type SessionType =
  | 'Know About my Career'
  | 'Resume/CV Review'
  | 'Campus France'
  | 'Undergrad Application'
  | 'Grad Application'
  | 'TOEFL Exam Prep Advice'
  | 'IELTS Exam Prep Advice'
  | 'Duolingo Exam Prep Advice'
  | 'Mock Interview'
  | 'Portfolio Review'
  | 'General Mentorship'
  | 'Technical Discussion'
  | 'Project Feedback'
  | 'Study Planning'
  | 'Exam Preparation'
  | 'Industry Insights'
  | 'Career Switch Advice'
  | 'Salary Negotiation'
  | 'Job Search Strategy'
  | 'Interview Preparation'
  | 'Resume Building'
  | 'LinkedIn Profile Review'
  | 'Personal Branding'
  | 'Networking Tips'
  | 'Work-Life Balance'
  | 'Leadership Skills'
  | 'Entrepreneurship'
  | 'Know About my Academic Major';

export const SESSION_TYPES: SessionType[] = [
  'Know About my Career',
  'Resume/CV Review',
  'Campus France',
  'Undergrad Application',
  'Grad Application',
  'TOEFL Exam Prep Advice',
  'IELTS Exam Prep Advice',
  'Duolingo Exam Prep Advice',
  'Mock Interview',
  'Portfolio Review',
  'General Mentorship',
  'Technical Discussion',
  'Project Feedback',
  'Study Planning',
  'Exam Preparation',
  'Industry Insights',
  'Career Switch Advice',
  'Salary Negotiation',
  'Job Search Strategy',
  'Interview Preparation',
  'Resume Building',
  'LinkedIn Profile Review',
  'Personal Branding',
  'Networking Tips',
  'Work-Life Balance',
  'Leadership Skills',
  'Entrepreneurship',
  'Know About my Academic Major'
];

export interface TimeSlot {
  id: string;
  start_date_time: string;
  end_date_time: string;
  is_available: boolean;
  recurring: boolean;
  day_of_week?: number;
}

export type Availability = TimeSlot;

export interface CalendarViewProps {
  isMentor: boolean;
  events: CalendarEvent[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  availabilitySlots: TimeSlot[];
  isLoading: boolean;
}

export interface EventsSidebarProps {
  selectedDate: Date;
  events: CalendarEvent[];
  isMentor: boolean;
  onEventDelete: (event: CalendarEvent) => void;
}

export interface TimeSlotFormProps {
  profileId: string;
  onSubmit: (newSlot: Partial<TimeSlot>) => Promise<void>;
  onCancel: () => void;
}

export interface UnavailableTimeFormProps {
  profileId: string;
  onSubmit: (newSlot: Partial<TimeSlot>) => Promise<void>;
  onCancel: () => void;
}

export interface AvailabilityManagerProps {
  profileId: string;
  onUpdate?: () => Promise<void>;
}

export interface ExistingTimeSlotsProps {
  slots: TimeSlot[];
  onDelete: (id: string) => Promise<void>;
  isLoading: boolean;
}

export interface SessionTypeSelectProps {
  control: Control<any>;
  availableTypes: SessionType[];
}