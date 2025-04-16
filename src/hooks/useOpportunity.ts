
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { OpportunityWithAuthor, OpportunityAnalytics } from "@/types/opportunity/types";

export function useOpportunity(id: string) {
  return useQuery({
    queryKey: ['opportunity', id],
    queryFn: async () => {
      // Fetch opportunity details with author profile
      const { data, error } = await supabase
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
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(`Error fetching opportunity: ${error.message}`);
      }

      // Fetch analytics data
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('opportunity_analytics')
        .select('*')
        .eq('opportunity_id', id)
        .single();

      if (analyticsError && analyticsError.code !== 'PGRST116') { // Not found is ok
        console.error("Error fetching analytics:", analyticsError);
      }

      // Increment views count
      try {
        if (analyticsData) {
          await supabase
            .from('opportunity_analytics')
            .update({ views_count: (analyticsData.views_count || 0) + 1 })
            .eq('id', analyticsData.id);
        } else {
          // Create analytics record if it doesn't exist
          await supabase
            .from('opportunity_analytics')
            .insert({
              opportunity_id: id,
              views_count: 1,
              checked_out_count: 0,
              bookmarks_count: 0
            });
        }
      } catch (updateError) {
        console.error("Failed to update views count:", updateError);
      }

      // Combine data
      const result = data as OpportunityWithAuthor;
      if (analyticsData) {
        (result as any).analytics = analyticsData as OpportunityAnalytics;
      }

      return result;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
