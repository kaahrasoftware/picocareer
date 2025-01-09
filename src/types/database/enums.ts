export type Status = "Pending" | "Approved" | "Rejected";

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

export type Degree = 
  | "No Degree"
  | "High School"
  | "Associate"
  | "Bachelor"
  | "Master"
  | "Doctorate";

export type UserType = 
  | "mentor"
  | "mentee"
  | "admin";

export type SchoolType = 
  | "High School"
  | "Community College"
  | "University"
  | "Other";

export { Status, NotificationType, NotificationCategory, Degree, UserType, SchoolType };