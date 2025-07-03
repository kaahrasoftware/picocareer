
export interface HubStorageMetrics {
  id: string;
  hub_id: string;
  bucket_id: string;
  total_storage_bytes: number;
  file_count: number;
  resources_count: number;
  logo_count: number;
  banner_count: number;
  announcements_count: number;
  last_calculated_at: string;
  created_at: string; // Added missing property
  updated_at: string;
}

export interface MemberGrowth {
  month: string;
  new_members: number;
  total_members: number;
}

export interface AnalyticsSummary {
  totalMembers: number;
  activeMembers: number;
  totalStorage: number;
  totalResources: number;
  memberLimit: number;
  resourceCount: number;
  announcementCount: number;
  totalAnnouncements: number;
  storageUsage: number;
  storageLimit: number;
}

// Add missing engagement types
export interface ResourceEngagement {
  resource_id: string;
  resource_title: string;
  view_count: number;
  download_count: number;
  engagement_rate: number;
}

export interface AnnouncementEngagement {
  announcement_id: string;
  announcement_title: string;
  view_count: number;
  reaction_count: number;
  engagement_rate: number;
}

// Fix: Add missing exports for PicoChat
export interface CareerChatMessage {
  id: string;
  message: string;
  timestamp: string;
  sender: 'user' | 'assistant';
}

export interface CareerAnalysisResult {
  recommendations: string[];
  analysis: string;
  confidence: number;
}

export interface CareerChatSession {
  id: string;
  profile_id?: string;
  status?: string;
  created_at?: string;
  session_metadata?: ChatSessionMetadata;
  progress_data: {
    [key: string]: number;
    education: number;
    skills: number;
    workstyle: number;
    goals: number;
    overall: number;
  };
  total_messages?: number;
  last_active_at?: string;
  is_suspended?: boolean;
}

export interface ChatSessionMetadata {
  title?: string;
  startedAt?: string;
  completedAt?: string;
  overallProgress?: number;
  currentQuestionIndex?: number;
  lastCategory?: string;
  isComplete?: boolean;
  questionCounts?: {
    education: number;
    skills: number;
    workstyle: number;
    goals: number;
    [key: string]: number;
  };
  [key: string]: any;
}
