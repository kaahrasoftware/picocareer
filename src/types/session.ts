import { Control } from "react-hook-form";

export type MeetingPlatform = "Google Meet" | "Zoom" | "Microsoft Teams" | "Telegram" | "WhatsApp" | "Phone Call";

export interface SessionType {
  id: string;
  profile_id: string;
  type: SessionTypeEnum;
  duration: number;
  price: number;
  description?: string;
  created_at: string;
  updated_at: string;
  meeting_platform: MeetingPlatform[];
  telegram_username?: string;
  phone_number?: string;
  token_cost: number;
  custom_type_name?: string; // Field for custom type name
}

export type SessionTypeEnum =
  | "Know About my Career"
  | "Resume/CV Review"
  | "Campus France"
  | "Undergrad Application"
  | "Grad Application"
  | "TOEFL Exam Prep Advice"
  | "IELTS Exam Prep Advice"
  | "Duolingo Exam Prep Advice"
  | "SAT Exam Prep Advice"
  | "ACT Exam Prep Advice"
  | "GRE Exam Prep Advice"
  | "GMAT Exam Prep Advice"
  | "MCAT Exam Prep Advice"
  | "LSAT Exam Prep Advice"
  | "DAT Exam Prep Advice"
  | "Advice for PhD Students"
  | "How to Find Grants/Fellowships"
  | "Grant Writing Guidance"
  | "Interview Prep"
  | "How to Succeed as a College Student"
  | "Investment Strategies"
  | "Study Abroad Programs"
  | "Tips for F-1 Students"
  | "College Application Last Review"
  | "Application Essays Review"
  | "I need someone to practice my presentation with"
  | "Study Tips"
  | "Volunteer Opportunities"
  | "Know About my Academic Major"
  | "Custom"; // Custom type option

// Add the SESSION_TYPE_OPTIONS export
export const SESSION_TYPE_OPTIONS: SessionTypeEnum[] = [
  "Know About my Career",
  "Resume/CV Review",
  "Campus France",
  "Undergrad Application",
  "Grad Application",
  "TOEFL Exam Prep Advice",
  "IELTS Exam Prep Advice",
  "Duolingo Exam Prep Advice",
  "SAT Exam Prep Advice",
  "ACT Exam Prep Advice",
  "GRE Exam Prep Advice",
  "GMAT Exam Prep Advice",
  "MCAT Exam Prep Advice",
  "LSAT Exam Prep Advice",
  "DAT Exam Prep Advice",
  "Advice for PhD Students",
  "How to Find Grants/Fellowships",
  "Grant Writing Guidance",
  "Interview Prep",
  "How to Succeed as a College Student",
  "Investment Strategies",
  "Study Abroad Programs",
  "Tips for F-1 Students",
  "College Application Last Review",
  "Application Essays Review",
  "I need someone to practice my presentation with",
  "Study Tips",
  "Volunteer Opportunities",
  "Know About my Academic Major",
  "Custom" // Custom type option in array
];

export interface SessionTypeFormData {
  type: SessionTypeEnum;
  duration: number;
  price: number;
  description: string;
  meeting_platform: MeetingPlatform[];
  telegram_username?: string;
  phone_number?: string;
  custom_type_name?: string; // Field for custom type name
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

export interface Availability {
  id: string;
  profile_id: string;
  is_available?: boolean;
  created_at: string;
  updated_at: string;
  recurring?: boolean;
  day_of_week?: number;
  start_date_time?: string;
  end_date_time?: string;
  timezone_offset: number;
}

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
