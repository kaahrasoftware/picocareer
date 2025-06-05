
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Status } from '@/types/database/enums';

interface AdminCareersQueryOptions {
  statusFilter: Status | 'all';
  industryFilter?: string;
  page: number;
  pageSize: number;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}

export function useAdminCareersQuery(options: AdminCareersQueryOptions) {
  return useQuery({
    queryKey: ['admin-careers', options],
    queryFn: async () => {
      let query = supabase
        .from('careers')
        .select(`
          *,
          profiles (
            id,
            full_name,
            avatar_url,
            email
          )
        `, { count: 'exact' });

      // Apply filters
      if (options.statusFilter !== 'all') {
        query = query.eq('status', options.statusFilter);
      }

      if (options.industryFilter && options.industryFilter !== 'all') {
        query = query.eq('industry', options.industryFilter);
      }

      if (options.searchTerm) {
        query = query.or(`title.ilike.%${options.searchTerm}%,description.ilike.%${options.searchTerm}%,industry.ilike.%${options.searchTerm}%`);
      }

      if (options.startDate) {
        query = query.gte('created_at', options.startDate);
      }

      if (options.endDate) {
        query = query.lte('created_at', options.endDate);
      }

      // Apply sorting
      query = query.order(options.sortBy, { ascending: options.sortDirection === 'asc' });

      // Apply pagination
      const from = (options.page - 1) * options.pageSize;
      const to = from + options.pageSize - 1;
      query = query.range(from, to);

      const { data: careers, error, count } = await query;

      if (error) throw error;

      // Get summary statistics
      const { data: statsData } = await supabase
        .from('careers')
        .select('status, featured, industry, complete_career');

      const totalCount = count || 0;
      const totalPages = Math.ceil(totalCount / options.pageSize);
      
      // Calculate stats
      const approvedCount = statsData?.filter(item => item.status === 'Approved').length || 0;
      const pendingCount = statsData?.filter(item => item.status === 'Pending').length || 0;
      const featuredCount = statsData?.filter(item => item.featured === true).length || 0;
      const completedCount = statsData?.filter(item => item.complete_career === true).length || 0;

      // Industry breakdown
      const industryBreakdown = statsData?.reduce((acc, item) => {
        if (item.industry) {
          acc[item.industry] = (acc[item.industry] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>) || {};

      return {
        careers: careers || [],
        totalCount,
        totalPages,
        approvedCount,
        pendingCount,
        featuredCount,
        completedCount,
        industryBreakdown: Object.entries(industryBreakdown).map(([name, count]) => ({ name, count }))
      };
    },
    enabled: true,
  });
}
