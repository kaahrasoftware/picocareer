import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useFeaturedCareers() {
  return useQuery({
    queryKey: ['featured-careers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('careers')
        .select('*')
        .eq('featured', true)
        .eq('status', 'Approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });
}