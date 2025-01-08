export type NotificationType = 
  | "session_booked"
  | "session_cancelled"
  | "session_reminder"
  | "session_feedback"
  | "major_update"
  | "career_update"
  | "blog_update"
  | "profile_update"
  | "mentor_request"
  | "blog_posted";

export type Categories = "Technology" | "Business" | "Science" | "Arts" | "Engineering";

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
  | "click"
  | "view"
  | "scroll"
  | "search"
  | "bookmark"
  | "share";

export type Language = "English" | "French" | "Spanish" | "German" | "Chinese" | "Japanese";

export type MeetingPlatform = "Google Meet" | "WhatsApp" | "Telegram" | "Phone Call";

export type OnboardingStatus = "Pending" | "Completed" | "In Progress";

export type SessionType = 
  | "Know About my Career"
  | "Resume/CV Review"
  | "Campus France"
  | "Undergrad Application"
  | "Grad Application"
  | "TOEFL Exam Prep Advice"
  | "IELTS Exam Prep Advice"
  | "Duolingo Exam Prep Advice"
  | "GRE Exam Prep Advice"
  | "GMAT Exam Prep Advice"
  | "SAT Exam Prep Advice"
  | "LSAT Exam Prep Advice";

export type SettingType = 
  | "theme"
  | "language"
  | "timezone"
  | "notifications"
  | "privacy";

export type UserType = "admin" | "mentor" | "mentee" | "editor";

export type Status = "Pending" | "Approved" | "Rejected";

export type SchoolType = "University" | "College" | "Technical School" | "High School";

export type Country = 
  | "United States"
  | "Canada"
  | "United Kingdom"
  | "Australia"
  | "France"
  | "Germany"
  | "Japan"
  | "China"
  | "India"
  | "Brazil"
  | "Other";