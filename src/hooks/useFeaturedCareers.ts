import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useFeaturedCareers() {
  return useQuery({
    queryKey: ['featured-careers'],
    queryFn: async () => {
      console.log('Fetching featured careers...');
      const { data, error } = await supabase
        .from('careers')
        .select('*')
        .eq('featured', true)
        .eq('status', 'Approved')
        .eq('complete_career', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching featured careers:', error);
        throw error;
      }

      console.log('Fetched featured careers:', data);
      return data || [];
    },
    retry: 3,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });
}