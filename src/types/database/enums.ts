
export type OpportunityType = 
  | "job"
  | "internship" 
  | "scholarship"
  | "fellowship"
  | "grant"
  | "competition"
  | "event"
  | "volunteer"
  | "other";

export type Status = "Approved" | "Pending" | "Rejected";

export type HubMemberRole = "admin" | "member" | "moderator";

export type ChatRoomType = "public" | "private";

export type ReactionType = "like" | "love" | "laugh" | "wow" | "sad" | "angry";

export type AnnouncementCategory = "general" | "urgent" | "event" | "update";

export type AuditAction = "create" | "update" | "delete" | "invite" | "remove";

export type ResourceType = "document" | "image" | "video" | "link";

export type ResourceAccessLevel = "public" | "members" | "admin";

export type DocumentType = "pdf" | "doc" | "presentation" | "spreadsheet";

export type HubType = "company" | "school" | "organization";

export type WebinarPlatform = "Google Meet" | "Zoom" | "Microsoft Teams";

export type EventType = "workshop" | "webinar" | "conference" | "networking";

export type MeetingPlatform = "Google Meet" | "Zoom" | "Microsoft Teams" | "Phone Call" | "WhatsApp" | "Telegram";

export type SessionType = "career_guidance" | "mock_interview" | "resume_review" | "portfolio_review" | "networking" | "skill_development" | "other";

export type Country = "United States" | "Canada" | "United Kingdom" | "Other";

export type WhereDidYouHearAboutUs = "Social Media" | "Friend" | "Website" | "Other";
