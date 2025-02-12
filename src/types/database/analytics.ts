
export interface HubAnalytics {
  id: string;
  hub_id: string;
  metric_type: string;
  metric_value: Record<string, any>;
  measured_at: string;
  created_at: string;
  updated_at: string;
}

export interface MemberGrowth {
  hub_id: string;
  month: string;
  new_members: number;
}

export interface AnalyticsSummary {
  totalMembers: number;
  activeMembers: number;
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

export interface DepartmentMetrics {
  department_id: string;
  metric_type: string;
  metric_value: number;
  measured_at: string;
}

