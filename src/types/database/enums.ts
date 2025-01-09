export type NotificationType = 
  | "session_booked"
  | "session_cancelled"
  | "session_reminder"
  | "mentor_request"
  | "system_update"
  | "profile_update";

export type NotificationCategory = 
  | "all" 
  | "unread" 
  | "session" 
  | "system" 
  | "mentorship" 
  | "general";

export type Categories = 
  | "career"
  | "education"
  | "technology"
  | "health"
  | "finance"
  | "lifestyle";

export type Degree = 
  | "No Degree"
  | "High School"
  | "Associate"
  | "Bachelor"
  | "Master"
  | "Doctorate";

export type FeedbackType = 
  | "positive"
  | "negative"
  | "neutral";

export type InteractionType = 
  | "message"
  | "call"
  | "video";

export type Language = 
  | "English"
  | "Spanish"
  | "French"
  | "German"
  | "Chinese"
  | "Japanese";

export type MeetingPlatform = 
  | "Zoom"
  | "Google Meet"
  | "Microsoft Teams"
  | "Skype";

export type OnboardingStatus = 
  | "not_started"
  | "in_progress"
  | "completed";

export type SessionType = 
  | "one_on_one"
  | "group";

export type SettingType = 
  | "notification"
  | "privacy"
  | "account";

export type Status = 
  | "active"
  | "inactive"
  | "pending"
  | "completed";

export type UserType = 
  | "mentor"
  | "mentee"
  | "admin";
