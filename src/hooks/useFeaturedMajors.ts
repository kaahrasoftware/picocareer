import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Major } from "@/types/database/majors";

export function useFeaturedMajors() {
  return useQuery({
    queryKey: ["featured-majors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("majors")
        .select(`
          *,
          potential_salary,
          skill_match,
          tools_knowledge,
          common_courses
        `)
        .eq("featured", true)
        .limit(6);

      if (error) {
        throw error;
      }

      console.log("Featured majors data:", data); // Debug log

      // Transform the data to include all required fields
      const transformedData: Major[] = data.map(major => ({
        ...major,
        image_url: null,
        field_of_study: null,
        required_courses: [],
        degree_level: major.degree_levels?.[0] || null,
        // Ensure these fields are properly typed
        potential_salary: major.potential_salary || 'N/A',
        skill_match: major.skill_match || [],
        tools_knowledge: major.tools_knowledge || [],
        common_courses: major.common_courses || []
      }));

      console.log("Transformed majors data:", transformedData); // Debug log

      return transformedData;
    },
  });
}