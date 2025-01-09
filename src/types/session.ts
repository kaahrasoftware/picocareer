import { Database } from "@/types/database/database.types";

export type SessionType = Database["public"]["Tables"]["mentor_session_types"]["Row"]["type"];
export type MeetingPlatform = "Google Meet" | "WhatsApp" | "Telegram" | "Phone Call";

export interface SessionTypeFormData {
  type: SessionType;
  duration: number;
  price: number;
  description: string;
  meeting_platform: MeetingPlatform[];
  telegram_username?: string;
  phone_number?: string;
}

export const SESSION_TYPE_OPTIONS: SessionType[] = [
  "Know About your Career",
  "Resume/CV Review",
  "Campus France",
  "Undergrad Application",
  "Grad Application",
  "TOEFL Exam Prep Advice",
  "IELTS Exam Prep Advice",
  "Duolingo Exam Prep Advice",
  "LSAT Exam Prep Advice",
  "ACT Exam Prep Advice",
  "GRE Exam Prep Advice",
  "GMAT Exam Prep Advice",
  "MCAT Exam Prep Advice",
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

export const MEETING_PLATFORMS: MeetingPlatform[] = [
  "Google Meet",
  "WhatsApp",
  "Telegram",
  "Phone Call"
];