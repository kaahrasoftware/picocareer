
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type OpportunityType = 'scholarship' | 'internship' | 'job' | 'fellowship' | 'grant' | 'competition' | 'volunteer' | 'event' | 'other';
type OpportunityStatus = 'Active' | 'Pending' | 'Rejected' | 'Expired';

interface AdminOpportunitiesFilters {
  type?: OpportunityType;
  status?: OpportunityStatus;
  search?: string;
  location?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export function useAdminOpportunitiesQuery(filters: AdminOpportunitiesFilters = {}) {
  return useQuery({
    queryKey: ['admin-opportunities', filters],
    queryFn: async () => {
      let query = supabase
        .from('opportunities')
        .select(`
          *,
          profiles!opportunities_author_id_fkey (
            first_name,
            last_name,
            email
          ),
          companies (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (filters.type && filters.type !== 'other') {
        query = query.eq('type', filters.type);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      if (filters.dateRange) {
        query = query
          .gte('created_at', filters.dateRange.start.toISOString())
          .lte('created_at', filters.dateRange.end.toISOString());
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export const OPPORTUNITY_TYPES: OpportunityType[] = [
  'scholarship',
  'internship', 
  'job',
  'fellowship',
  'grant',
  'competition',
  'volunteer',
  'event',
  'other'
];

export const OPPORTUNITY_STATUSES: OpportunityStatus[] = [
  'Active',
  'Pending', 
  'Rejected',
  'Expired'
];
