
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
