
export interface AnalyticsSummary {
  totalMembers: number;
  activeMembers: number;
  totalResources: number;
  totalAnnouncements: number;
  storageUsed: number;
  storageLimit: number;
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
}

export interface HubStorageMetrics {
  total_storage_bytes: number;
  file_count: number;
  resources_count: number;
  announcements_count: number;
  banner_count: number;
  logo_count: number;
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
  status: string;
  created_at: string;
  session_metadata: ChatSessionMetadata;
  progress_data: any;
  total_messages: number;
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
