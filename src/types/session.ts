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

export interface SessionType {
  id: string;
  profile_id: string;
  type: SessionTypeEnum;
  duration: number;
  price: number;
  description?: string;
  meeting_platform: ("Google Meet" | "WhatsApp" | "Telegram" | "Phone Call")[];
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