export type NotificationType = 
  | 'session_booked'
  | 'session_cancelled'
  | 'session_reminder'
  | 'major_update';

export type NotificationCategory = 
  | 'general'
  | 'session'
  | 'major_update';