import { Control } from "react-hook-form";
import { MeetingPlatform } from "./calendar";

export type SessionTypeEnum = 
  | "Know About my Career"
  | "Resume/CV Review"
  | "Campus France"
  | "Undergrad Application"
  | "Grad Application"
  | "TOEFL Exam Prep Advice"
  | "IELTS Exam Prep Advice"
  | "Duolingo Exam Prep Advice"
  | "SAT Exam Prep Advise"
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
  | "Know About my Academic Major";

export const SESSION_TYPE_OPTIONS: SessionTypeEnum[] = [
  "Know About my Career",
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
  "Study Tips",
  "Volunteer Opportunities",
  "Know About my Academic Major"
];

export interface SessionTypeFormData {
  type: SessionTypeEnum;
  duration: number;
  price: number;
  description: string;
  meeting_platform: MeetingPlatform[];
  telegram_username?: string;
  phone_number?: string;
}

export interface SessionTypeFormProps {
  profileId: string;
  onSuccess: () => void;
  onCancel: () => void;
  existingTypes: {
    id: string;
    type: string;
    duration: number;
    description: string | null;
  }[];
}

export interface FormProps {
  control: Control<SessionTypeFormData>;
}

export interface PlatformFieldsProps {
  form: FormProps;
  showTelegramField: boolean;
  showPhoneField: boolean;
  showWhatsAppField: boolean;
}

export interface PlatformSelectProps {
  form: FormProps;
}

export interface SessionTypeSelectProps {
  form: FormProps;
  availableTypes: SessionTypeEnum[];
}