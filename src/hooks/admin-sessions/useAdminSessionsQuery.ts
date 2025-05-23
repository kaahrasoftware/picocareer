
import { useQuery } from "@tanstack/react-query";
import { SessionQueryParams } from "./types";
import { buildSessionsQuery } from "./useSessionsQueryBuilder";

export function useAdminSessionsQuery(params: SessionQueryParams = {}) {
  return useQuery({
    queryKey: [
      "admin-sessions", 
      params.statusFilter, 
      params.page, 
      params.pageSize, 
      params.startDate, 
      params.endDate, 
      params.searchTerm, 
      params.sortBy, 
      params.sortDirection
    ],
    queryFn: () => buildSessionsQuery(params),
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
}
