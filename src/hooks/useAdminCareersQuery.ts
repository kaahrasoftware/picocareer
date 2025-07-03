
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AdminCareersFilters {
  status?: 'Approved' | 'Pending' | 'Rejected';
  search?: string;
  authorId?: string;
}

export function useAdminCareersQuery(filters: AdminCareersFilters = {}) {
  return useQuery({
    queryKey: ['admin-careers', filters],
    queryFn: async () => {
      let query = supabase
        .from('careers')
        .select(`
          *,
          profiles!careers_author_id_fkey (
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters.authorId) {
        query = query.eq('author_id', filters.authorId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
