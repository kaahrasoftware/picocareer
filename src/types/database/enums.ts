
// Database enums for type safety
export enum Categories {
  TECHNOLOGY = "Technology",
  DIGITAL_TOOLS = "Digital Tools",
  EXTRACURRICULAR_ACTIVITIES = "Extracurricular Activities",
  SUCCESS_STORIES = "Success Stories",
  VOLUNTEERISM = "Volunteerism",
  COMMUNITY_SERVICE = "Community Service",
  ENTREPRENEURSHIP = "Entrepreneurship",
  CAREER_GUIDANCE = "Career Guidance",
  ACADEMIC_EXCELLENCE = "Academic Excellence",
  LEADERSHIP = "Leadership",
  NETWORKING = "Networking",
  PROFESSIONAL_DEVELOPMENT = "Professional Development",
  RESEARCH = "Research",
  INTERNSHIPS = "Internships",
  SCHOLARSHIPS = "Scholarships",
  MENTORSHIP = "Mentorship",
  STUDY_ABROAD = "Study Abroad",
  GRADUATE_SCHOOL = "Graduate School",
  CAREER_TRANSITIONS = "Career Transitions",
  WORK_LIFE_BALANCE = "Work-Life Balance",
  FINANCIAL_LITERACY = "Financial Literacy",
  PERSONAL_BRANDING = "Personal Branding",
  INTERVIEW_SKILLS = "Interview Skills",
  RESUME_WRITING = "Resume Writing"
}

export enum Degree {
  HIGH_SCHOOL = "High School",
  ASSOCIATES = "Associate's",
  BACHELORS = "Bachelor's",
  MASTERS = "Master's",
  DOCTORATE = "Doctorate",
  PROFESSIONAL = "Professional",
  CERTIFICATE = "Certificate"
}

export enum FeedbackType {
  SESSION = "session",
  PLATFORM = "platform",
  MENTOR = "mentor",
  GENERAL = "general"
}

export enum InteractionType {
  VIEW = "view",
  DOWNLOAD = "download",
  SHARE = "share",
  BOOKMARK = "bookmark"
}

export enum Language {
  ENGLISH = "English",
  SPANISH = "Spanish",
  FRENCH = "French",
  GERMAN = "German",
  CHINESE = "Chinese",
  JAPANESE = "Japanese",
  KOREAN = "Korean",
  ARABIC = "Arabic",
  HINDI = "Hindi",
  PORTUGUESE = "Portuguese",
  RUSSIAN = "Russian",
  ITALIAN = "Italian"
}

export enum MeetingPlatform {
  GOOGLE_MEET = "Google Meet",
  WHATSAPP = "WhatsApp",
  TELEGRAM = "Telegram",
  PHONE_CALL = "Phone Call"
}

export enum NotificationType {
  SESSION_REMINDER = "session_reminder",
  SESSION_UPDATE = "session_update",
  CAREER_UPDATE = "career_update",
  HUB_MEMBERSHIP = "hub_membership",
  GENERAL = "general"
}

export enum OnboardingStatus {
  NOT_STARTED = "not_started",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed"
}

export enum SchoolType {
  PUBLIC = "Public",
  PRIVATE = "Private",
  COMMUNITY_COLLEGE = "Community College",
  UNIVERSITY = "University",
  TECHNICAL = "Technical",
  ONLINE = "Online"
}

export enum SessionType {
  CAREER_GUIDANCE = "Career Guidance",
  MOCK_INTERVIEW = "Mock Interview",
  RESUME_REVIEW = "Resume Review",
  NETWORKING = "Networking",
  CUSTOM = "Custom"
}

export enum SettingType {
  NOTIFICATION = "notification",
  PRIVACY = "privacy",
  SESSION_SETTINGS = "session_settings",
  TIMEZONE = "timezone"
}

export enum Status {
  PENDING = "Pending",
  APPROVED = "Approved",
  REJECTED = "Rejected",
  PUBLISHED = "Published"
}

export enum UserType {
  ADMIN = "admin",
  MENTOR = "mentor",
  MENTEE = "mentee",
  EDITOR = "editor"
}

export enum OpportunityType {
  INTERNSHIP = "internship",
  JOB = "job", 
  SCHOLARSHIP = "scholarship",
  FELLOWSHIP = "fellowship",
  RESEARCH = "research",
  VOLUNTEER = "volunteer",
  GRANT = "grant",
  COMPETITION = "competition",
  EVENT = "event",
  OTHER = "other"
}

export enum OpportunityStatus {
  PENDING = "Pending",
  ACTIVE = "Active",
  REJECTED = "Rejected",
  CLOSED = "Closed"
}

export enum ApplicationStatus {
  DRAFT = "draft",
  SUBMITTED = "submitted",
  UNDER_REVIEW = "under_review",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  WITHDRAWN = "withdrawn"
}
