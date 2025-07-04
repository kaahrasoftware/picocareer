
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { School } from "@/types/database/schools";

export function useFeaturedSchools(limit: number = 6) {
  return useQuery({
    queryKey: ['featuredSchools', limit],
    queryFn: async (): Promise<School[]> => {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .eq('status', 'Approved')
        .eq('featured', true)
        .order('featured_priority', { ascending: true, nullsFirst: false })
        .limit(limit);
      
      if (error) {
        console.error('Error fetching featured schools:', error);
        throw error;
      }
      
      return (data || []) as School[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
