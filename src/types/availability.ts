
import { MeetingPlatform } from "./calendar";

export interface TimeSlotInputsProps {
  timeSlots: any[];
  selectedDate: Date;
  selectedStartTime: string;
  selectedEndTime: string;
  isRecurring: boolean;
  userTimezone: string;
  onStartTimeSelect: (time: string) => void;
  onEndTimeSelect: (time: string) => void;
  onRecurringChange: () => void;
}

export interface ProfileAvatarProps {
  avatarUrl: string;
  imageAlt?: string;
  size: "sm" | "md" | "lg";
  editable?: boolean;
  onChange?: (file: File) => void;
}

export interface SessionTypeFormData {
  type: string;
  duration: number;
  price: number;
  description?: string;
  meeting_platform: MeetingPlatform[];
  phone_number?: string;
  telegram_username?: string;
}

export type SessionTypeEnum = 
  | "Career Guidance"
  | "Mock Interview"
  | "Resume Review"
  | "Technical Mentoring"
  | "Academic Advising"
  | "Industry Insights"
  | "SAT Exam Prep Advice";

export interface MentorAvailabilityFormData {
  profile_id: string;
  start_date_time: string;
  end_date_time: string;
  is_available: boolean;
  recurring?: boolean;
  day_of_week?: number;
  timezone_offset: number;
}

export interface AvailabilityRequest {
  id: string;
  mentor_id: string;
  mentee_id: string;
  created_at: string;
  status?: 'pending' | 'accepted' | 'rejected';
}
