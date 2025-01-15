export type NotificationType = 
  | "major_update"
  | "session_booked"
  | "session_cancelled"
  | "session_reminder"
  | "mentor_request"
  | "system_update"
  | "profile_update";

export type NotificationCategory = 
  | "all"
  | "system"
  | "unread"
  | "session"
  | "mentorship"
  | "general"
  | "major_update";
  
export interface Notification {
  id: string;
  profile_id: string;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  action_url: string;
  created_at: string;
  read: boolean;
}
