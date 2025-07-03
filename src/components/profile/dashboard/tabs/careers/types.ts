
import type { ContentStatus } from '../../types';

export interface AdminCareersFilters {
  searchQuery: string;
  statusFilter: ContentStatus | "all";
  industryFilter: string;
  featuredFilter: string;
  completeFilter: string;
}

export interface CareerStats {
  totalCount: number;
  approvedCount: number;
  pendingCount: number;
  featuredCount: number;
  completedCount: number;
  industryBreakdown: Record<string, number>;
}

export interface CareerManagementData {
  careers: any[];
  totalPages: number;
  stats: CareerStats;
}
