export type NotificationType = 
  | 'session_booked'
  | 'session_cancelled'
  | 'session_reminder'
  | 'major_update'
  | 'general';

export type NotificationCategory = 
  | 'session'
  | 'major_update'
  | 'general';

export interface Notification {
  id: string;
  profile_id: string;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  read: boolean;
  created_at: string;
  action_url?: string;
}