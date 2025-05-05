
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { OpportunityWithAuthor, OpportunityWithAnalytics } from "@/types/opportunity/types";
import { OpportunityStatus } from "@/types/database/enums";

interface AdminOpportunitiesQueryParams {
  statusFilter?: OpportunityStatus | 'all';
  typeFilter?: string;
  page: number;
  pageSize: number;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

interface AdminOpportunitiesResult {
  opportunities: OpportunityWithAnalytics[];
  totalCount: number;
  totalPages: number;
  pendingCount: number;
  activeCount: number;
  featuredCount: number;
  totalViews: number;
  totalApplications: number;
}

export const useAdminOpportunitiesQuery = ({
  statusFilter = 'all',
  typeFilter,
  page = 1,
  pageSize = 10,
  startDate,
  endDate,
  searchTerm = '',
  sortBy = 'created_at',
  sortDirection = 'desc'
}: AdminOpportunitiesQueryParams) => {
  return useQuery({
    queryKey: ['admin-opportunities', statusFilter, typeFilter, page, pageSize, startDate, endDate, searchTerm, sortBy, sortDirection],
    queryFn: async () => {
      try {
        // Calculate pagination values
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        // Start building the query for opportunities with author details
        let query = supabase
          .from('opportunities')
          .select(`
            *,
            profiles (
              id, 
              full_name, 
              avatar_url,
              email
            )
          `);

        // Apply status filter
        if (statusFilter !== 'all') {
          query = query.eq('status', statusFilter);
        }

        // Apply type filter
        if (typeFilter && typeFilter !== 'all') {
          query = query.eq('opportunity_type', typeFilter);
        }

        // Apply date range filter
        if (startDate) {
          query = query.gte('created_at', startDate);
        }
        
        if (endDate) {
          query = query.lte('created_at', endDate);
        }

        // Apply search filter
        if (searchTerm) {
          query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,provider_name.ilike.%${searchTerm}%`);
        }

        // Get total count first
        const { count, error: countError } = await supabase
          .from('opportunities')
          .select('*', { count: 'exact', head: true });

        if (countError) {
          throw new Error(`Error fetching opportunities count: ${countError.message}`);
        }

        // Get counts for different statuses
        const { data: statusCounts, error: statusError } = await supabase
          .from('opportunities')
          .select('status, count(*)', { count: 'exact' })
          .group('status');

        if (statusError) {
          throw new Error(`Error fetching status counts: ${statusError.message}`);
        }

        // Get featured count
        const { count: featuredCount, error: featuredError } = await supabase
          .from('opportunities')
          .select('*', { count: 'exact', head: true })
          .eq('featured', true);

        if (featuredError) {
          throw new Error(`Error fetching featured count: ${featuredError.message}`);
        }

        // Get analytics totals
        const { data: analyticsTotals, error: analyticsError } = await supabase
          .from('opportunity_analytics')
          .select('views_count, applications_count');

        if (analyticsError) {
          throw new Error(`Error fetching analytics data: ${analyticsError.message}`);
        }

        // Apply sorting
        query = query.order(sortBy, { ascending: sortDirection === 'asc' });

        // Apply pagination
        query = query.range(from, to);

        // Execute final query
        const { data: opportunities, error } = await query;

        if (error) {
          throw new Error(`Error fetching opportunities: ${error.message}`);
        }

        // Fetch analytics for all opportunities
        const opportunityIds = opportunities.map(opp => opp.id);
        
        let opportunitiesWithAnalytics = [...opportunities] as OpportunityWithAnalytics[];

        if (opportunityIds.length > 0) {
          const { data: analyticsData, error: analyticsError } = await supabase
            .from('opportunity_analytics')
            .select('*')
            .in('opportunity_id', opportunityIds);
          
          if (analyticsError) {
            console.error('Error fetching analytics:', analyticsError);
          }
          
          if (analyticsData) {
            // Merge analytics data with opportunities
            const analyticsMap = analyticsData.reduce((acc, item) => {
              acc[item.opportunity_id] = item;
              return acc;
            }, {} as Record<string, any>);
            
            opportunitiesWithAnalytics = opportunities.map((opp: any) => {
              return {
                ...opp,
                analytics: analyticsMap[opp.id] || {
                  views_count: 0,
                  applications_count: 0,
                  bookmarks_count: 0
                }
              };
            });
          }
        }

        // Calculate totals
        const pendingCount = statusCounts?.find(s => s.status === 'Pending')?.count || 0;
        const activeCount = statusCounts?.find(s => s.status === 'Active')?.count || 0;
        
        const totalViews = analyticsTotals?.reduce((sum, item) => sum + (item.views_count || 0), 0) || 0;
        const totalApplications = analyticsTotals?.reduce((sum, item) => sum + (item.applications_count || 0), 0) || 0;

        return {
          opportunities: opportunitiesWithAnalytics,
          totalCount: count || 0,
          totalPages: Math.ceil((count || 0) / pageSize),
          pendingCount,
          activeCount,
          featuredCount: featuredCount || 0,
          totalViews,
          totalApplications
        } as AdminOpportunitiesResult;
      } catch (error) {
        console.error('Error in useAdminOpportunitiesQuery:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
