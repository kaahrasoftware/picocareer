import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useTopRatedMentors = () => {
  return useQuery({
    queryKey: ['topRatedMentors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_type', 'mentor')
        .eq('featured', true)
        .limit(4);

      if (error) throw error;
      return data;
    }
  });
};