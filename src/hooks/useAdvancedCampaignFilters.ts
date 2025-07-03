
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CampaignFilters {
  search: string;
  status: string;
  contentType: string;
  frequency: string;
  dateRange: {
    from?: Date;
    to?: Date;
  };
}

export interface CampaignPagination {
  currentPage: number;
  pageSize: number;
}

export function useAdvancedCampaignFilters(adminId: string) {
  const [filters, setFilters] = useState<CampaignFilters>({
    search: '',
    status: 'all',
    contentType: 'all',
    frequency: 'all',
    dateRange: {}
  });

  const [pagination, setPagination] = useState<CampaignPagination>({
    currentPage: 1,
    pageSize: 10
  });

  const { data: campaignsData, isLoading, refetch } = useQuery({
    queryKey: ['campaigns', adminId, filters, pagination],
    queryFn: async () => {
      let query = supabase
        .from('email_campaigns')
        .select('*', { count: 'exact' })
        .eq('admin_id', adminId);

      if (filters.search) {
        query = query.ilike('subject', `%${filters.search}%`);
      }

      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters.contentType !== 'all') {
        query = query.eq('content_type', filters.contentType);
      }

      if (filters.frequency !== 'all') {
        query = query.eq('frequency', filters.frequency);
      }

      // Add date range filtering if provided
      if (filters.dateRange.from && filters.dateRange.to) {
        query = query.gte('created_at', filters.dateRange.from.toISOString());
        query = query.lte('created_at', filters.dateRange.to.toISOString());
      }

      const { data, error, count } = await query
        .range(
          (pagination.currentPage - 1) * pagination.pageSize,
          pagination.currentPage * pagination.pageSize - 1
        )
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        campaigns: data || [],
        totalCount: count || 0
      };
    }
  });

  const refreshCampaigns = () => {
    refetch();
  };

  return {
    campaigns: campaignsData?.campaigns || [],
    totalCount: campaignsData?.totalCount || 0,
    filteredCount: campaignsData?.totalCount || 0,
    loading: isLoading,
    filters,
    pagination,
    setFilters,
    setPagination,
    refreshCampaigns
  };
}
