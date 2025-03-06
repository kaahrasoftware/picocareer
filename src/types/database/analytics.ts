
/**
 * Defines structured message types for the career chat
 */

export interface CareerChatMessage {
  id: string;
  session_id: string;
  message_type: "system" | "user" | "bot" | "recommendation" | "session_end";
  content: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface CareerAnalysisResult {
  careers: CareerRecommendation[];
  personalities: PersonalityInsight[];
  mentors: MentorRecommendation[];
}

export interface CareerRecommendation {
  id: string;
  title: string;
  score: number;
  reasoning: string;
  metadata?: Record<string, any>;
  key_requirements?: string[];
  education_paths?: string[];
}

export interface PersonalityInsight {
  type: string;
  title: string;
  score: number;
  description: string;
  traits?: string[];
  strengths?: string[];
}

export interface MentorRecommendation {
  id: string;
  name: string;
  skills: string[];
  position?: string;
  experience?: number;
  sessions?: number;
  location?: string;
  reasoning: string;
}

export interface HubStorageMetrics {
  id: string;
  hub_id: string;
  total_storage_bytes: number;
  file_count: number;
  resources_count: number;
  logo_count: number;
  banner_count: number;
  announcements_count: number;
  updated_at: string;
  last_calculated_at: string;
}

export interface HubMemberMetrics {
  id: string;
  hub_id: string;
  total_members: number;
  active_members: number;
  updated_at: string;
}

export interface MemberGrowth {
  year: number;
  month: number;
  new_members: number;
  total_members: number;
}

export interface AnalyticsSummary {
  active_users: number;
  engagement_rate: number;
  content_count: number;
  growth_rate: number;
}

export interface ResourceEngagement {
  resource_type: string;
  views: number;
  downloads: number;
  shares: number;
}

export interface AnnouncementEngagement {
  category: string;
  views: number;
  reactions: number;
}
