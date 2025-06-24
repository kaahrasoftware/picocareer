
// Consolidated MeetingPlatform type to match the session types
export type MeetingPlatform = "Google Meet" | "WhatsApp" | "Telegram" | "Phone Call" | "Zoom" | "Microsoft Teams";

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
  attendees?: string[];
  meetingPlatform?: MeetingPlatform;
  meetingLink?: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  timezoneOffset?: number;
}
