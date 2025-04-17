
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useOpportunityCategories() {
  return useQuery({
    queryKey: ['opportunity-categories-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('opportunities')
        .select('categories')
        .not('categories', 'is', null);
      
      if (error) throw error;
      
      // Extract unique categories from all opportunities
      const allCategories = data.flatMap(item => item.categories || []);
      // Filter out empty values and duplicates
      const uniqueCategories = [...new Set(allCategories.filter(Boolean))];
      return uniqueCategories.sort();
    }
  });
}
