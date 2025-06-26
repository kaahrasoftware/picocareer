
import { MeetingPlatform } from "@/types/calendar";
import { SessionTypeEnum } from "@/types/session";

export interface SessionTypeFormData {
  type: SessionTypeEnum;
  duration: number;
  price: number;
  description?: string;
  meeting_platform: MeetingPlatform[];
  phone_number?: string;
  telegram_username?: string;
  custom_type_name?: string; // Added custom type name field
}

export interface SessionTypeFormProps {
  profileId: string;
  onSuccess: () => void;
  onCancel: () => void;
  existingTypes: Array<{
    id: string;
    type: string;
    duration: number;
    price: number;
    description?: string | null;
    meeting_platform?: MeetingPlatform[];
    telegram_username?: string | null;
    phone_number?: string | null;
    custom_type_name?: string | null; // Added custom type name field
  }>;
}

export const SESSION_TYPES = {
  "Career Guidance": "Career Guidance",
  "Mock Interview": "Mock Interview",
  "Resume Review": "Resume Review",
  "Technical Mentoring": "Technical Mentoring",
  "Academic Advising": "Academic Advising",
  "Industry Insights": "Industry Insights",
  "SAT Exam Prep Advice": "SAT Exam Prep Advice",
  "Custom": "Custom" // Added Custom type
} as const;

export type SessionTypeEnum = keyof typeof SESSION_TYPES;
