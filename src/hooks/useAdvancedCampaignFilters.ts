
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfDay, endOfDay } from 'date-fns';

export interface Campaign {
  id: string;
  subject: string;
  content_type: string;
  status: string;
  frequency: string;
  recipient_type: string;
  scheduled_for?: string;
  created_at: string;
  sent_count: number;
  recipients_count: number;
  admin_id: string;
}

export interface CampaignFilters {
  search: string;
  status: string;
  contentType: string;
  frequency: string;
  dateRange: {
    from?: Date;
    to?: Date;
  };
  page: number;
  pageSize: number;
}

const DEFAULT_FILTERS: CampaignFilters = {
  search: '',
  status: 'all',
  contentType: 'all',
  frequency: 'all',
  dateRange: {},
  page: 1,
  pageSize: 10,
};

export function useAdvancedCampaignFilters() {
  const [filters, setFilters] = useState<CampaignFilters>(DEFAULT_FILTERS);

  const { data: campaigns = [], isLoading, error } = useQuery({
    queryKey: ['email-campaigns', filters],
    queryFn: async () => {
      let query = supabase
        .from('email_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply search filter
      if (filters.search) {
        query = query.ilike('subject', `%${filters.search}%`);
      }

      // Apply status filter
      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      // Apply content type filter
      if (filters.contentType !== 'all') {
        query = query.eq('content_type', filters.contentType);
      }

      // Apply frequency filter
      if (filters.frequency !== 'all') {
        query = query.eq('frequency', filters.frequency);
      }

      // Apply date range filter
      if (filters.dateRange.from) {
        query = query.gte('created_at', startOfDay(filters.dateRange.from).toISOString());
      }
      if (filters.dateRange.to) {
        query = query.lte('created_at', endOfDay(filters.dateRange.to).toISOString());
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    },
  });

  const filteredCampaigns = useMemo(() => {
    const startIndex = (filters.page - 1) * filters.pageSize;
    const endIndex = startIndex + filters.pageSize;
    return campaigns.slice(startIndex, endIndex);
  }, [campaigns, filters.page, filters.pageSize]);

  const totalPages = Math.ceil(campaigns.length / filters.pageSize);

  const updateFilters = (newFilters: Partial<CampaignFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: newFilters.page ?? 1, // Reset to page 1 when other filters change
    }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  return {
    campaigns: filteredCampaigns,
    totalCampaigns: campaigns.length,
    filters,
    updateFilters,
    resetFilters,
    isLoading,
    error,
    pagination: {
      currentPage: filters.page,
      totalPages,
      pageSize: filters.pageSize,
      hasNextPage: filters.page < totalPages,
      hasPreviousPage: filters.page > 1,
    },
  };
}
