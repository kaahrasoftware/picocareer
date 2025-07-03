
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
