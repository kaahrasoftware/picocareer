import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

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
      return data as Tables<"careers">[];
    }
  });
};