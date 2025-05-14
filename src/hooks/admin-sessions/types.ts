
// Admin sessions types
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
  scheduled: number;
  completed: number;
  cancelled: number;
  no_show: number;
}

export interface AdminSessionsResponse {
  sessions: any[];
  totalPages: number;
  statusCounts: StatusCounts;
}
