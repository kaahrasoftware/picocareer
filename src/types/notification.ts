import { Database } from "@/types/database/database.types";

export type NotificationType = Database["public"]["Enums"]["notification_type"];
export type NotificationCategory = "general" | "session" | "content" | "system" | "major_update" | "all" | "unread" | "mentorship";

export interface Notification {
  id: string;
  profile_id: string;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  read: boolean;
  action_url?: string | null;
  created_at: string;
  updated_at: string;
}