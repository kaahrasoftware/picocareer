import type { NotificationType, NotificationCategory } from './enums';

export interface Notification {
  id: string;
  profile_id: string;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  read: boolean;
  created_at: string;
  updated_at: string;
  action_url?: string;
}

export type NotificationGroup = Record<NotificationCategory, Notification[]>;