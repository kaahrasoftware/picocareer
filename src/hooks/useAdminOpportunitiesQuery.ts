
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface OpportunityWithAnalytics {
  id: string;
  title: string;
  description: string;
  status: string;
  deadline?: string;
  created_at: string;
  opportunity_type?: string;
  provider_name?: string;
  applications_count?: number;
  views_count?: number;
  bookmarks_count?: number;
}

export function useAdminOpportunitiesQuery() {
  return useQuery({
    queryKey: ['admin-opportunities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('opportunities')
        .select(`
          id,
          title,
          description,
          status,
          deadline,
          created_at,
          opportunity_type,
          provider_name
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(item => ({
        ...item,
        applications_count: 0,
        views_count: 0,
        bookmarks_count: 0
      })) as OpportunityWithAnalytics[];
    },
  });
}
