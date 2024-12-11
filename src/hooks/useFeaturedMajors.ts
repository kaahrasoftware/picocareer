import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useFeaturedMajors = () => {
  return useQuery({
    queryKey: ['featuredMajors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('majors')
        .select('*')
        .eq('featured', true)
        .limit(4);

      if (error) throw error;
      return data;
    }
  });
};