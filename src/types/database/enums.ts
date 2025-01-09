export type NotificationType = 
  | "session_booked"
  | "session_cancelled"
  | "session_reminder"
  | "mentor_request"
  | "system_update"
  | "profile_update"
  | "major_update";

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