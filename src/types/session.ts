export enum SessionTypeEnum {
  CAREER_ADVICE = "Know About my Career",
  RESUME_REVIEW = "Resume/CV Review",
  CAMPUS_FRANCE = "Campus France",
  UNDERGRAD_APPLICATION = "Undergrad Application",
  GRAD_APPLICATION = "Grad Application",
  TOEFL_PREP = "TOEFL Exam Prep Advice",
  IELTS_PREP = "IELTS Exam Prep Advice",
  DUOLINGO_PREP = "Duolingo Exam Prep Advice",
  ACADEMIC_MAJOR = "Know About my Academic Major",
  MOCK_INTERVIEW = "Mock Interview",
  INTERNSHIP_ADVICE = "Internship Advice",
  JOB_SEARCH = "Job Search Strategy",
  NETWORKING = "Professional Networking",
  PERSONAL_BRANDING = "Personal Branding",
  ENTREPRENEURSHIP = "Entrepreneurship Guidance",
  LEADERSHIP = "Leadership Development",
  WORK_LIFE_BALANCE = "Work-Life Balance",
  CAREER_TRANSITION = "Career Transition",
  SALARY_NEGOTIATION = "Salary Negotiation",
  PROFESSIONAL_DEVELOPMENT = "Professional Development",
  INDUSTRY_INSIGHTS = "Industry Insights",
  SKILL_DEVELOPMENT = "Skill Development",
  PORTFOLIO_REVIEW = "Portfolio Review",
  STARTUP_ADVICE = "Startup Advice",
  GRAD_SCHOOL_PREP = "Graduate School Preparation",
  RESEARCH_GUIDANCE = "Research Guidance",
  THESIS_ADVICE = "Thesis/Dissertation Advice",
  ACADEMIC_PLANNING = "Academic Planning"
}

export type MeetingPlatform = "Google Meet" | "WhatsApp" | "Telegram" | "Phone Call";

export const SESSION_TYPE_OPTIONS: Record<SessionTypeEnum, string> = {
  [SessionTypeEnum.CAREER_ADVICE]: "Get advice about your career path",
  [SessionTypeEnum.RESUME_REVIEW]: "Get feedback on your resume/CV",
  [SessionTypeEnum.CAMPUS_FRANCE]: "Guidance for Campus France applications",
  [SessionTypeEnum.UNDERGRAD_APPLICATION]: "Help with undergraduate applications",
  [SessionTypeEnum.GRAD_APPLICATION]: "Help with graduate school applications",
  [SessionTypeEnum.TOEFL_PREP]: "TOEFL exam preparation guidance",
  [SessionTypeEnum.IELTS_PREP]: "IELTS exam preparation guidance",
  [SessionTypeEnum.DUOLINGO_PREP]: "Duolingo exam preparation guidance",
  [SessionTypeEnum.ACADEMIC_MAJOR]: "Learn about academic majors",
  [SessionTypeEnum.MOCK_INTERVIEW]: "Practice interview skills",
  [SessionTypeEnum.INTERNSHIP_ADVICE]: "Get internship search advice",
  [SessionTypeEnum.JOB_SEARCH]: "Job search strategy guidance",
  [SessionTypeEnum.NETWORKING]: "Professional networking tips",
  [SessionTypeEnum.PERSONAL_BRANDING]: "Personal branding guidance",
  [SessionTypeEnum.ENTREPRENEURSHIP]: "Entrepreneurship guidance",
  [SessionTypeEnum.LEADERSHIP]: "Leadership development advice",
  [SessionTypeEnum.WORK_LIFE_BALANCE]: "Work-life balance guidance",
  [SessionTypeEnum.CAREER_TRANSITION]: "Career transition guidance",
  [SessionTypeEnum.SALARY_NEGOTIATION]: "Salary negotiation tips",
  [SessionTypeEnum.PROFESSIONAL_DEVELOPMENT]: "Professional development advice",
  [SessionTypeEnum.INDUSTRY_INSIGHTS]: "Industry insights and trends",
  [SessionTypeEnum.SKILL_DEVELOPMENT]: "Skill development guidance",
  [SessionTypeEnum.PORTFOLIO_REVIEW]: "Portfolio review and feedback",
  [SessionTypeEnum.STARTUP_ADVICE]: "Startup advice and guidance",
  [SessionTypeEnum.GRAD_SCHOOL_PREP]: "Graduate school preparation",
  [SessionTypeEnum.RESEARCH_GUIDANCE]: "Research methodology guidance",
  [SessionTypeEnum.THESIS_ADVICE]: "Thesis/Dissertation advice",
  [SessionTypeEnum.ACADEMIC_PLANNING]: "Academic planning guidance"
};

export interface SessionType {
  id: string;
  profile_id: string;
  type: SessionTypeEnum;
  duration: number;
  price: number;
  description?: string;
  meeting_platform: MeetingPlatform[];
  telegram_username?: string;
  phone_number?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Session {
  id: string;
  mentor_id: string;
  mentee_id: string;
  session_type_id: string;
  scheduled_at: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  meeting_link?: string;
  meeting_platform?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  session_type?: SessionType;
  mentor?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  mentee?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}