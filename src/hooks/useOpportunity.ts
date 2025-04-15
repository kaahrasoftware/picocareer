
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { OpportunityWithAuthor } from "@/types/opportunity/types";

export function useOpportunity(id: string) {
  return useQuery({
    queryKey: ['opportunity', id],
    queryFn: async () => {
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

      // Increment views count
      try {
        await supabase
          .from('opportunities')
          .update({ views_count: (data.views_count || 0) + 1 })
          .eq('id', id);
      } catch (updateError) {
        console.error("Failed to update views count:", updateError);
      }

      return data as OpportunityWithAuthor;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
