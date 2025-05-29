
export interface AnalyticsSummary {
  totalMembers: number;
  activeMembers: number;
  totalResources: number;
  totalAnnouncements: number;
  storageUsed: number;
  storageLimit: number;
  memberLimit: number;
  resourceCount: number;
  announcementCount: number;
}

export interface ResourceEngagement {
  resource_id: string;
  title: string;
  view_count: number;
  download_count: number;
  share_count: number;
}

export interface AnnouncementEngagement {
  announcement_id: string;
  title: string;
  view_count: number;
  reaction_count: number;
}

export interface MemberGrowth {
  month: string;
  new_members: number;
  year: number;
  date: string;
}

export interface HubStorageMetrics {
  total_storage_bytes: number;
  file_count: number;
  resources_count: number;
  announcements_count: number;
  banner_count: number;
  logo_count: number;
  last_calculated_at: string;
}

export interface CareerChatMessage {
  id: string;
  session_id: string;
  message_type: 'system' | 'user' | 'bot' | 'recommendation' | 'session_end';
  content: string;
  metadata?: any;
  created_at: string;
  delivery_metadata?: any;
  message_index?: number;
  status?: string;
}

export interface CareerChatSession {
  id: string;
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
  profile_id?: string;
}

export interface ChatSessionMetadata {
  title?: string;
  lastCategory?: string;
  isComplete?: boolean;
  overallProgress?: number;
  startedAt?: string;
  completedAt?: string;
  questionCounts?: {
    education: number;
    skills: number;
    workstyle: number;
    goals: number;
    [key: string]: number;
  };
  categoryProgress?: {
    [category: string]: number;
  };
  careerInterests?: string[];
  [key: string]: any;
}
