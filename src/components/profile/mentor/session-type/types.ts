
import { MeetingPlatform } from "@/types/calendar";

export interface SessionTypeFormData {
  type: string;
  duration: number;
  price: number;
  description?: string;
  meeting_platform: MeetingPlatform[];
  phone_number?: string;
  telegram_username?: string;
}

export const SESSION_TYPES = {
  "Career Guidance": "Career Guidance",
  "Mock Interview": "Mock Interview",
  "Resume Review": "Resume Review",
  "Technical Mentoring": "Technical Mentoring",
  "Academic Advising": "Academic Advising",
  "Industry Insights": "Industry Insights",
  "SAT Exam Prep Advice": "SAT Exam Prep Advice"
} as const;

export type SessionTypeEnum = keyof typeof SESSION_TYPES;
