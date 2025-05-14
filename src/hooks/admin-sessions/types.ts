
import type { MentorSession } from "@/types/database/session";

export interface SessionQueryParams {
  statusFilter?: string;
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface StatusCounts {
  total: number;
  completed: number;
  scheduled: number;
  cancelled: number;
  no_show: number;
}

export interface SessionsQueryResult {
  sessions: MentorSession[];
  totalCount: number;
  totalPages: number;
  statusCounts: StatusCounts;
}
