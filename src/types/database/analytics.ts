
// If this file doesn't exist yet, we'll create it with the necessary types

export interface HubStorageMetrics {
  total_storage_bytes: number;
  file_count: number;
  resources_count: number;
  logo_count: number;
  banner_count: number;
  announcements_count: number;
  last_calculated_at: string;
  storage_limit_bytes?: number;
}

export interface HubMemberMetrics {
  total_members: number;
  active_members: number;
  member_limit?: number;
}

export interface AnalyticsSummary {
  totalMembers: number;
  memberLimit: number;
  activeMembers: number;
  resourceCount: number;
  announcementCount: number;
  storageUsed: number;
  storageLimit: number;
}

export interface MemberGrowth {
  month: string; // For backward compatibility
  date?: string; // Added for daily data
  new_members: number;
  hub_id: string;
}

export interface ResourceEngagement {
  id: string;
  hub_id: string;
  resource_id: string;
  title: string;
  view_count: number;
  download_count: number;
  share_count: number;
  created_at: string;
  updated_at: string;
}

export interface AnnouncementEngagement {
  id: string;
  hub_id: string;
  announcement_id: string;
  title: string;
  view_count: number;
  reaction_count: number;
  created_at: string;
  updated_at: string;
}

// Career chatbot interfaces
export interface CareerChatSession {
  id: string;
  profile_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
}

export interface CareerChatMessage {
  id: string;
  session_id: string;
  message_type: 'user' | 'bot' | 'system' | 'recommendation';
  content: string;
  metadata: any;
  created_at: string;
}

export interface CareerRecommendation {
  id: string;
  session_id: string;
  career_id: string;
  score: number;
  reasoning: string;
  created_at: string;
  metadata: any;
  career?: {
    title: string;
    description: string;
    image_url?: string;
  }
}

export interface CareerAnalysisResult {
  careers: {
    title: string;
    score: number;
    reasoning: string;
  }[];
  personalityTraits: string[];
  learningStyles: string[];
}
