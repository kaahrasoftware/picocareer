export type Categories =
  | "Technology"
  | "Digital Tools"
  | "Extracurricular Activities"
  | "Success Stories"
  | "Volunteerism"
  | "Community Service"
  | "Entrepreneurship"
  | "Financial Literacy"
  | "Arts Careers"
  | "STEM Education"
  | "STEM Careers"
  | "Humanities Careers"
  | "Diversity and Inclusion"
  | "Educational Resources"
  | "Leadership Development"
  | "Mental Health"
  | "Wellbeing"
  | "High School to University Transition"
  | "Study Abroad Preparation"
  | "Personal Branding"
  | "Internship and Job Search"
  | "Networking Strategies"
  | "Skill Development"
  | "University Admissions"
  | "Career Guidance";

export type Degree =
  | "No Degree"
  | "High School"
  | "Associate"
  | "Bachelor"
  | "Master"
  | "MD"
  | "PhD";

export type FeedbackType = "mentor_feedback" | "mentee_feedback";

export type InteractionType =
  | "page_view"
  | "click"
  | "search"
  | "bookmark"
  | "content_view";

export type Language =
  | "English"
  | "Spanish"
  | "French"
  | "Chinese"
  | "Hindi"
  | "Arabic"
  | "Bengali"
  | "Portuguese"
  | "Russian"
  | "German"
  | "Japanese"
  | "Nigerian Pidgin"
  | "Turkish"
  | "Hausa"
  | "Swahili"
  | "Vietnamese"
  | "Korean"
  | "Italian"
  | "Thai"
  | "Marathi"
  | "Yoruba"
  | "Polish"
  | "Malayalam"
  | "Ukrainian"
  | "Zulu"
  | "Igbo"
  | "Afrikaans"
  | "Ewe"
  | "Twi"
  | "Anufo";

export type MeetingPlatform = "google_meet" | "whatsapp" | "telegram";

export type NotificationType =
  | "session_booked"
  | "session_cancelled"
  | "session_reminder"
  | "profile_update"
  | "mentor_request"
  | "blog_posted"
  | "major_update";

export type OnboardingStatus = 
  | "Pending"
  | "Under Review"
  | "Consent Signed"
  | "Approved"
  | "Rejected";

export type SchoolType = "High School" | "Community College" | "University" | "Other";

export type SessionType =
  | "First Touch"
  | "Know About your Career"
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
  | "I need someone to practice my presentation with";

export type SettingType =
  | "timezone"
  | "notifications"
  | "language"
  | "theme"
  | "notification_preferences"
  | "language_preference";

export type Status = "Approved" | "Pending" | "Rejected";

export type UserType = "mentor" | "mentee" | "admin" | "editor";

export type OpportunityType =
  | "job"
  | "internship"
  | "scholarship"
  | "fellowship"
  | "grant"
  | "competition"
  | "volunteer"
  | "event"
  | "other";

export type OpportunityStatus =
  | "Active"
  | "Pending"
  | "Closed"
  | "Expired"
  | "Draft"
  | "Rejected";

export type ApplicationStatus =
  | "Not Applied"
  | "Applied"
  | "In Progress"
  | "Accepted"
  | "Rejected"
  | "Withdrawn";
