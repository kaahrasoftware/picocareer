
export interface HubStorageMetrics {
  hub_id: string;
  bucket_id: string;
  total_storage_bytes: number;
  file_count: number;
  resources_count: number;
  logo_count: number;
  banner_count: number;
  announcements_count: number;
  last_calculated_at: string;
  created_at: string;
  updated_at: string;
}

export interface HubMemberMetrics {
  hub_id: string;
  total_members: number;
  active_members: number;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsSummary {
  totalMembers: number;
  memberLimit: number;
  activeMembers: number;
  resourceCount: number;
  totalResources: number;
  announcementCount: number;
  totalAnnouncements: number;
  storageUsed: number;
  storageLimit: number;
}

export interface MemberGrowth {
  month: string;
  year: number;
  date: string;
  new_members: number;
}
