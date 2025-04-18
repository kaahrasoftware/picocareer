
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { OpportunityFilters, OpportunityWithAuthor } from "@/types/opportunity/types";

export function useOpportunities(filters: OpportunityFilters = {}) {
  return useQuery({
    queryKey: ['opportunities', filters],
    queryFn: async () => {
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
        `)
        .eq('status', 'Active');

      // Apply filters - only apply type filter if it's not "all"
      if (filters.type && filters.type !== 'all') {
        query = query.eq('opportunity_type', filters.type);
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,provider_name.ilike.%${filters.search}%`);
      }

      if (filters.category) {
        query = query.contains('categories', [filters.category]);
      }

      if (filters.featured !== undefined) {
        query = query.eq('featured', filters.featured);
      }

      if (filters.remote !== undefined) {
        query = query.eq('remote', filters.remote);
      }

      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      if (filters.deadline) {
        const currentDate = new Date();
        const deadline = new Date(filters.deadline);
        
        if (deadline > currentDate) {
          query = query.lte('deadline', deadline.toISOString());
        }
      }

      // Order by most recent first
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        throw new Error(`Error fetching opportunities: ${error.message}`);
      }

      // Fetch analytics data for all opportunities
      const opportunityIds = data.map(opp => opp.id);
      
      if (opportunityIds.length > 0) {
        const { data: analyticsData, error: analyticsError } = await supabase
          .from('opportunity_analytics')
          .select('*')
          .in('opportunity_id', opportunityIds);
        
        if (!analyticsError && analyticsData) {
          // Merge analytics data with opportunities
          const analyticsMap = analyticsData.reduce((acc, item) => {
            acc[item.opportunity_id] = item;
            return acc;
          }, {} as Record<string, any>);
          
          data.forEach(opp => {
            if (analyticsMap[opp.id]) {
              (opp as any).analytics = analyticsMap[opp.id];
            }
          });
        }
      }

      return data as OpportunityWithAuthor[];
    },
  });
}
