
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Campaign } from '@/types/database/email';

export interface FilterState {
  status: string | null;
  contentType: string | null;
  frequency: string | null;
  search: string;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
}

interface PaginationState {
  currentPage: number;
  pageSize: number;
}

interface UseAdvancedCampaignFiltersReturn {
  campaigns: Campaign[];
  totalCount: number;
  filteredCount: number;
  loading: boolean;
  filters: FilterState;
  pagination: PaginationState;
  setFilters: (filters: FilterState) => void;
  setPagination: (pagination: PaginationState) => void;
  refreshCampaigns: () => void;
}

export function useAdvancedCampaignFilters(adminId: string): UseAdvancedCampaignFiltersReturn {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const [filters, setFilters] = useState<FilterState>({
    status: null,
    contentType: null,
    frequency: null,
    search: '',
    dateRange: { from: null, to: null }
  });

  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    pageSize: 20
  });

  const buildQuery = () => {
    let query = supabase
      .from('email_campaigns')
      .select(`
        id, 
        subject, 
        content_type, 
        content_id, 
        content_ids,
        frequency, 
        scheduled_for,
        status,
        sent_at,
        recipient_type,
        sent_count,
        failed_count,
        recipients_count,
        created_at,
        last_error,
        last_checked_at,
        admin_id,
        updated_at
      `)
      .eq('admin_id', adminId);

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.contentType) {
      query = query.eq('content_type', filters.contentType);
    }

    if (filters.frequency) {
      query = query.eq('frequency', filters.frequency);
    }

    if (filters.search) {
      query = query.ilike('subject', `%${filters.search}%`);
    }

    if (filters.dateRange.from) {
      query = query.gte('created_at', filters.dateRange.from.toISOString());
    }

    if (filters.dateRange.to) {
      query = query.lte('created_at', filters.dateRange.to.toISOString());
    }

    return query;
  };

  const fetchCampaigns = async () => {
    if (!adminId) return;

    setLoading(true);
    try {
      // Get total count first
      const { count: total } = await supabase
        .from('email_campaigns')
        .select('*', { count: 'exact', head: true })
        .eq('admin_id', adminId);

      setTotalCount(total || 0);

      // Get filtered count
      const { count: filtered } = await buildQuery()
        .select('*', { count: 'exact', head: true });

      setFilteredCount(filtered || 0);

      // Get paginated data
      const startIndex = (pagination.currentPage - 1) * pagination.pageSize;
      const endIndex = startIndex + pagination.pageSize - 1;

      const { data, error } = await buildQuery()
        .order('scheduled_for', { ascending: false })
        .range(startIndex, endIndex);

      if (error) throw error;

      const typedCampaigns: Campaign[] = (data || []).map(item => ({
        ...item,
        name: item.subject || "Unnamed Campaign",
        subject: item.subject || "Unnamed Campaign",
        status: (item.status as Campaign['status']) || "draft",
        sent_count: item.sent_count || 0,
        recipients_count: item.recipients_count || 0,
        failed_count: item.failed_count || 0,
        frequency: item.frequency as Campaign['frequency'] || "once"
      }));

      setCampaigns(typedCampaigns);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [adminId, filters, pagination]);

  // Reset to first page when filters change
  useEffect(() => {
    if (pagination.currentPage > 1) {
      setPagination(prev => ({ ...prev, currentPage: 1 }));
    }
  }, [filters]);

  return {
    campaigns,
    totalCount,
    filteredCount,
    loading,
    filters,
    pagination,
    setFilters,
    setPagination,
    refreshCampaigns: fetchCampaigns
  };
}
