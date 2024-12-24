import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useFeaturedMajors() {
  return useQuery({
    queryKey: ['featured-majors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('majors')
        .select('*')
        .eq('featured', true)
        .eq('status', 'Approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });
}