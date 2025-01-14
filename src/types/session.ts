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

export interface FormProps {
  control: Control<SessionTypeFormData>;
}

export const SESSION_TYPE_DESCRIPTIONS: Record<SessionTypeEnum, string> = {
  "Know About my Career": "Get insights about specific career paths, day-to-day responsibilities, challenges, and growth opportunities from experienced professionals.",
  "Resume/CV Review": "Receive detailed feedback on your resume/CV structure, content, and formatting to make it stand out to employers.",
  "Campus France": "Learn about studying in France, application processes, documentation requirements, and cultural preparation.",
  "Undergrad Application": "Get guidance on undergraduate application processes, essay writing, school selection, and application strategies.",
  "Grad Application": "Receive advice on graduate school applications, research proposals, statement of purpose, and program selection.",
  "TOEFL Exam Prep Advice": "Get tips and strategies for TOEFL exam preparation, including study plans and practice resources.",
  "IELTS Exam Prep Advice": "Learn effective preparation strategies for IELTS, including tips for all test sections.",
  "Duolingo Exam Prep Advice": "Get guidance on preparing for the Duolingo English Test, including format and practice strategies.",
  "SAT Exam Prep Advice": "Receive strategic advice for SAT preparation, including study planning and test-taking techniques.",
  "ACT Exam Prep Advice": "Learn effective strategies for ACT preparation across all test sections.",
  "GRE Exam Prep Advice": "Get comprehensive guidance on GRE preparation, including study materials and test strategies.",
  "GMAT Exam Prep Advice": "Receive strategic advice for GMAT preparation, including quantitative and verbal sections.",
  "MCAT Exam Prep Advice": "Learn about effective MCAT preparation strategies and resource management.",
  "LSAT Exam Prep Advice": "Get guidance on LSAT preparation, including logical reasoning and analytical skills.",
  "DAT Exam Prep Advice": "Receive preparation strategies for the Dental Admission Test.",
  "Advice for PhD Students": "Get insights on PhD program navigation, research planning, and academic career development.",
  "How to Find Grants/Fellowships": "Learn strategies for identifying and applying to relevant grants and fellowships.",
  "Grant Writing Guidance": "Get tips on writing compelling grant proposals and funding applications.",
  "Interview Prep": "Prepare for interviews with mock sessions, common questions, and industry-specific advice.",
  "How to Succeed as a College Student": "Learn effective study habits, time management, and college life balance strategies.",
  "Investment Strategies": "Get basic guidance on personal finance and investment planning for students.",
  "Study Abroad Programs": "Learn about study abroad opportunities, application processes, and preparation tips.",
  "Tips for F-1 Students": "Get guidance on F-1 visa requirements, maintenance, and student life in the US.",
  "College Application Last Review": "Get a final review of your college application materials before submission.",
  "Application Essays Review": "Receive feedback on your application essays' content, structure, and impact.",
  "I need someone to practice my presentation with": "Practice and receive feedback on presentation delivery and content.",
  "Study Tips": "Learn effective study techniques, time management, and academic success strategies.",
  "Volunteer Opportunities": "Discover meaningful volunteer opportunities and their impact on personal growth.",
  "Know About my Academic Major": "Get detailed insights about specific academic majors, coursework, and career prospects."
};