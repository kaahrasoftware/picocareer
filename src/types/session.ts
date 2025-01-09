import { Database } from "@/types/database/database.types";

export type SessionType = Database["public"]["Tables"]["mentor_session_types"]["Row"];
export type SessionTypeEnum = Database["public"]["Enums"]["session_type"];
export type MeetingPlatform = Database["public"]["Enums"]["meeting_platform"];

export interface SessionTypeFormData {
  type: SessionTypeEnum;
  duration: number;
  price: number;
  description: string;
  meeting_platform: MeetingPlatform[];
  telegram_username?: string;
  phone_number?: string;
}

export const SESSION_TYPE_OPTIONS: SessionTypeEnum[] = [
  "Know About your Career",
  "Resume/CV Review",
  "Campus France",
  "Undergrad Application",
  "Grad Application",
  "TOEFL Exam Prep Advice",
  "IELTS Exam Prep Advice",
  "Duolingo Exam Prep Advice",
  "SAT Exam Prep Advise",
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
  "Know About my Academic Major"
];