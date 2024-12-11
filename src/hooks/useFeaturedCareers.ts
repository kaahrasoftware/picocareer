import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useFeaturedCareers = () => {
  return useQuery({
    queryKey: ['featuredCareers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('careers')
        .select('*')
        .eq('featured', true)
        .limit(4);

      if (error) throw error;
      return data;
    }
  });
};