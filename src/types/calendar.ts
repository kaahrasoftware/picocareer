import { Database } from "@/types/database/database.types";
import { NotificationType } from "./notification";

export type Availability = Database["public"]["Tables"]["mentor_availability"]["Row"];

export type CalendarEvent = Database["public"]["Tables"]["calendar_events"]["Row"] & {
  session_details?: {
    id: string;
    scheduled_at: string;
    status: string;
    notes?: string;
    meeting_link?: string;
    mentor: {
      id: string;
      full_name: string;
      avatar_url?: string;
    };
    mentee: {
      id: string;
      full_name: string;
      avatar_url?: string;
    };
    session_type: {
      id: string;
      type: string;
      duration: number;
    };
  };
};

export type NotificationCategory = Database["public"]["Enums"]["notification_category"];

export const getNotificationCategory = (type: NotificationType): NotificationCategory => {
  switch (type) {
    case "session_booked":
    case "session_cancelled":
    case "session_reminder":
      return "mentorship";
    case "major_update":
      return "major_update";
    case "profile_update":
    case "mentor_request":
      return "general";
    default:
      return "system";
  }
};