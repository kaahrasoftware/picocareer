import { Control } from "react-hook-form";
import { MeetingPlatform } from "./calendar";

export type SessionTypeEnum = 
  | "Know About my Career"
  | "Resume Review"
  | "Mock Interview"
  | "Career Guidance"
  | "Academic Guidance"
  | "SAT Exam Prep Advice"
  | "College Application Review"
  | "General Mentorship";

export interface SessionTypeFormData {
  type: SessionTypeEnum;
  duration: number;
  price: number;
  description: string;
  meeting_platform: MeetingPlatform[];
  telegram_username?: string;
  phone_number?: string;
}

export interface FormProps {
  control: Control<SessionTypeFormData>;
}