export type MeetingPlatform = "Google Meet" | "WhatsApp" | "Telegram" | "Phone Call";

export interface MentorSession {
  id: string;
  scheduled_at: string;
  notes?: string;
  meeting_platform?: MeetingPlatform;
  meeting_link?: string;
  session_type?: {
    type: string;
    duration: number;
  };
  mentor?: {
    full_name: string;
  };
  mentee?: {
    full_name: string;
  };
}