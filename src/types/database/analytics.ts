
export interface MemberGrowth {
  month: string;
  new_members: number;
  hub_id: string;
}

export interface ResourceAnalytic {
  view_count: number;
  download_count: number;
  resource_id: string;
  title?: string;
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

export interface HubStorageMetrics {
  total_storage_bytes: number;
  file_count: number;
  resources_count: number;
  logo_count: number;
  banner_count: number;
  announcements_count: number;
  last_calculated_at: string;
  storage_limit_bytes: number;
}

export interface HubMemberMetrics {
  total_members: number;
  active_members: number;
  member_limit: number;
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
