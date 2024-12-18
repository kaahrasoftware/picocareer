import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Major } from "@/types/database/majors";

export function useFeaturedMajors() {
  return useQuery({
    queryKey: ['featured-majors'],
    queryFn: async () => {
      console.log('Fetching featured majors...');
      const { data, error } = await supabase
        .from('majors')
        .select(`
          id,
          title,
          description,
          potential_salary,
          skill_match,
          tools_knowledge,
          common_courses,
          degree_levels,
          profiles_count
        `)
        .eq('featured', true)
        .order('profiles_count', { ascending: false })
        .limit(6);

      if (error) {
        console.error('Error fetching featured majors:', error);
        throw error;
      }

      console.log('Featured majors fetched:', data?.length);
      return data as Major[];
    }
  });
}