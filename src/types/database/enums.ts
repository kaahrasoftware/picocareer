export type NotificationType = 
  | "session_booked"
  | "session_cancelled"
  | "session_reminder"
  | "mentor_request"
  | "system_update"
  | "profile_update"
  | "major_update";

export type NotificationCategory = 
  | "all" 
  | "system" 
  | "unread" 
  | "session" 
  | "mentorship" 
  | "general";

export type Degree = 
  | "No Degree"
  | "High School"
  | "Associate"
  | "Bachelor"
  | "Master"
  | "Doctorate"
  | "MD";

export type MeetingPlatform = 
  | "Google Meet"
  | "WhatsApp"
  | "Telegram"
  | "Phone Call";

export type SettingType = 
  | "theme"
  | "language"
  | "timezone"
  | "notification_preferences";

export type Categories =
  | "Career Guidance"
  | "Academic Advice"
  | "Test Preparation"
  | "Study Abroad"
  | "Professional Development";

export type FeedbackType =
  | "mentor_feedback"
  | "mentee_feedback";

export type InteractionType =
  | "click"
  | "view"
  | "scroll"
  | "search";

export type Language =
  | "English"
  | "Spanish"
  | "French"
  | "German"
  | "Chinese"
  | "Japanese"
  | "Arabic";

export type OnboardingStatus =
  | "Pending"
  | "Completed"
  | "In Progress";

export type SchoolType =
  | "University"
  | "College"
  | "Technical School"
  | "High School";

export type SessionType =
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

export type Status =
  | "Pending"
  | "Approved"
  | "Rejected";

export type UserType =
  | "mentee"
  | "mentor"
  | "admin"
  | "editor";